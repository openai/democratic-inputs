import openai
from pathlib import Path
import pandas as pd
from datetime import datetime, timedelta
from time import sleep
import random
from tenacity import (
    retry,
    wait_random_exponential,
    stop_after_attempt,
    retry_if_not_exception_type,
)
import tiktoken
from openai.error import RateLimitError
import configparser
import os
from generative_social_choice.utils.helper_functions import get_base_dir_path
import google.generativeai as palm

UTILS_DIR_PATH = get_base_dir_path() / "utils"

OPENAI_API_KEY_FILENAME = "OPENAI_API_KEY"
OPENAI_ORGANIZATION_FILENAME = "OPENAI_ORGANIZATION"
PALM_API_KEY_FILENAME = "PALM_API_KEY"
PALM_DEFAULT_MODEL = "models/text-bison-001"
# TODO: get user name and append to this file & commit usage
GPT_USAGE_FILENAME = "my_gpt_usage.csv"
CONFIG_FILENAME = "config.ini"

DEFAULT_TEMPERATURE = 1

# Read lab organization ID if exists
if Path(UTILS_DIR_PATH / OPENAI_ORGANIZATION_FILENAME).exists():
    with open(Path(UTILS_DIR_PATH / OPENAI_ORGANIZATION_FILENAME), "r") as f:
        openai.organization = f.readline()

# Read OpenAI API key from file
if not Path(UTILS_DIR_PATH / OPENAI_API_KEY_FILENAME).exists():
    print("Error: API key not found.")
    print(
        f"Please create a file in utils/ called {OPENAI_API_KEY_FILENAME} containing the API key."
    )
    exit(1)
else:
    with open(Path(UTILS_DIR_PATH / OPENAI_API_KEY_FILENAME), "r") as f:
        openai.api_key = f.readline()

# Read PaLM API key from file
if Path(UTILS_DIR_PATH / PALM_API_KEY_FILENAME).exists():
    with open(Path(UTILS_DIR_PATH / PALM_API_KEY_FILENAME), "r") as f:
        api_key = f.read()
        palm.configure(api_key=api_key)

# If my_gpt_usage.csv does not exist, create this object
if not Path(UTILS_DIR_PATH / GPT_USAGE_FILENAME).exists():
    print("Hello?")
    df = pd.DataFrame(
        columns=[
            "timestamp",
            "model",
            "prompt_tokens",
            "completion_tokens",
            "total_tokens",
        ]
    )
    df.to_csv(UTILS_DIR_PATH / GPT_USAGE_FILENAME, index=False)

# If config file does not exist, create this object
if not Path(UTILS_DIR_PATH / CONFIG_FILENAME).exists():
    config = configparser.ConfigParser()
    config["DEFAULT"] = {
        "safemode_default": True,
        "safemode_time_cooldown": 30,  # minutes
        "safemode_cost_limit": 5,  # dollars
        "batch_max_tries": 5,
    }
    with open(UTILS_DIR_PATH / CONFIG_FILENAME, "w") as configfile:
        config.write(configfile)

# Read config file
config = configparser.ConfigParser()
config.read(UTILS_DIR_PATH / CONFIG_FILENAME)
if config["DEFAULT"]["safemode_default"].lower() == "true":
    SAFEMODE_DEFAULT = True
elif config["DEFAULT"]["safemode_default"].lower() == "false":
    SAFEMODE_DEFAULT = False
else:
    raise ValueError(
        f"Invalid value of SAFEMODE_DEFUALT in {CONFIG_FILENAME}, must be True or False"
    )
SAFEMODE_TIME_COOLDOWN = int(config["DEFAULT"]["safemode_time_cooldown"])
SAFEMODE_COST_LIMIT = int(config["DEFAULT"]["safemode_cost_limit"])
BATCH_MAX_TRIES = int(config["DEFAULT"]["batch_max_tries"])

# Precompute encoders (used for counting tokens) since weirdly it takes time to grab the encoders
MODELS = ["gpt-4", "gpt-3.5-turbo", "gpt-4-0314"]
ENCODING_FOR_MODEL = {model: tiktoken.encoding_for_model(model) for model in MODELS}


def get_timestamp():
    return datetime.now().strftime("%Y-%m-%d-%H:%M:%S")


def parse_timestamp(ts):
    return datetime.strptime(ts, "%Y-%m-%d-%H:%M:%S")


def count_tokens(*, model, text):
    enc = ENCODING_FOR_MODEL[model]
    return len(enc.encode(text))


def compute_cost(df: pd.DataFrame) -> float:
    """
    Given a df tracking GPT usage, return the cost incurred.
    """
    prompt_cost_per_1k_tok = df["model"].apply(
        lambda model: 0.002
        if "gpt-3.5" in model
        else 0.03
        if "gpt-4" in model
        else None
    )
    completion_cost_per_1k_tok = df["model"].apply(
        lambda model: 0.002
        if "gpt-3.5" in model
        else 0.06
        if "gpt-4" in model
        else None
    )
    total_prompt_cost = sum(prompt_cost_per_1k_tok * df["prompt_tokens"] * 0.001)
    total_completion_cost = sum(
        completion_cost_per_1k_tok * df["completion_tokens"] * 0.001
    )
    return total_prompt_cost + total_completion_cost


def compute_monthly_cost(month: int, filename="my_gpt_usage.csv"):
    df = pd.read_csv(get_base_dir_path() / f"utils/{filename}")
    df["month"] = df["timestamp"].apply(lambda x: pd.to_datetime(x).month)
    return compute_cost(df[df["month"] == month])


# TODO: this crashed once on someone's system -- pandas is not good with timestamps
# ValueError: timestamp not in right format or something
def get_recent_rows(df: pd.DataFrame, minutes=SAFEMODE_TIME_COOLDOWN) -> pd.DataFrame:
    """
    Given a df with a timestamp column, return df with only rows with timestamp
    within the last <minutes> minutes.
    """
    current_time = datetime.now()
    time_delta = timedelta(minutes=minutes)
    lower_bound = current_time - time_delta
    recent_df = df[df["timestamp"].apply(parse_timestamp) >= lower_bound]
    return recent_df


def get_total_tokens_used():
    df = pd.read_csv(UTILS_DIR_PATH / GPT_USAGE_FILENAME)
    return df["total_tokens"].sum()


def _handle_wait_custom(retry_state):
    # If RateLimitError, back off for 1 minute + buffer
    # Otherwise, back off for a couple seconds
    if retry_state.outcome.failed and isinstance(
        retry_state.outcome.exception(), RateLimitError
    ):
        return 60 + random.randint(1, 10)
    else:
        return wait_random_exponential(1, 60)(retry_state)


@retry(
    stop=stop_after_attempt(BATCH_MAX_TRIES),
    wait=_handle_wait_custom,
    retry=retry_if_not_exception_type(
        openai.error.InvalidRequestError
    ),  # this means too many tokens
)
def gpt(model, messages, safemode=SAFEMODE_DEFAULT, temperature=DEFAULT_TEMPERATURE):
    """
    Wrapper around basic GPT-3.5/4 API query which tracks usage in a local file.

    model : "gpt-3.5-turbo" or "gpt-4"
    messages : a list of dicts, for example:
        [{"role" : "system", "content" : "Answer questions briefly."}
        {"role" : "user", "content" : "What is 2+2?"},
        {"role" : "assistant", "content" : "4."}]

    """
    safemode = False  # delete it later :(

    df = pd.read_csv(Path(UTILS_DIR_PATH / GPT_USAGE_FILENAME))

    if safemode:
        # Check if a lot of money has been spent in a short amount of time.
        # If yes, reject request.
        recent_df = get_recent_rows(df, SAFEMODE_TIME_COOLDOWN)
        recent_cost = compute_cost(recent_df)
        if recent_cost >= SAFEMODE_COST_LIMIT:
            raise RuntimeError(
                f"Safemode cost limit exceeded. You spent ${recent_cost:.2f} in the last {SAFEMODE_TIME_COOLDOWN} minutes -- either stop for a while or turn off safemode (pass safemode=False in your gpt calls)."
            )

    completion = openai.ChatCompletion.create(
        model=model, messages=messages, temperature=temperature
    )

    # Log usage
    usage_data = completion.usage
    usage_data["timestamp"] = get_timestamp()
    usage_data["model"] = completion.model
    df.loc[len(df)] = usage_data  # append row to df
    df.to_csv(Path(UTILS_DIR_PATH / GPT_USAGE_FILENAME), index=False)

    return completion

def prompt_gpt_base(prompt, **kwargs):
    """
    Simple wrapper around gpt4-base. For admissible arguments, check
    https://platform.openai.com/docs/api-reference/completions/create
    """
    model="gpt-4-base"
    df = pd.read_csv(Path(UTILS_DIR_PATH / GPT_USAGE_FILENAME))


    completion = openai.Completion.create(
        model=model,
        prompt=prompt,
        **kwargs)

    # Log usage
    usage_data = completion.usage
    usage_data["timestamp"] = get_timestamp()
    usage_data["model"] = completion.model
    df.loc[len(df)] = usage_data  # append row to df
    df.to_csv(Path(UTILS_DIR_PATH / GPT_USAGE_FILENAME), index=False)

    return completion.choices[0].text, completion



@retry(stop=stop_after_attempt(BATCH_MAX_TRIES), wait=wait_random_exponential(1, 60))
def prompt_palm(
    *,
    prompt,
    model=PALM_DEFAULT_MODEL,
):
    return palm.generate_text(prompt=prompt, model=model).result


def prompt_gpt(
    model, prompt, safemode=SAFEMODE_DEFAULT, temperature=DEFAULT_TEMPERATURE
):
    if model == "debug":
        return "debug mode, called gpt with prompt: " + prompt

    if model == "palm":
        return prompt_palm(prompt=prompt)

    else:
        completion = gpt(
            model,
            messages=[{"role": "user", "content": prompt}],
            safemode=safemode,
            temperature=temperature,
        )

        return completion.choices[0].message.content


if __name__ == "__main__":
    prompt = "2+2="
    models = ["gpt-3.5-turbo", "fake", "gpt-4", "gpt-4-32k", "palm"]
    for model in models:
        print("=" * 60)
        print(f"Testing {model}...")
        try:
            response = prompt_gpt(model=model, prompt=prompt)
        except Exception as e:
            print(f"Failed to call {model} ({e})")
        else:
            print(f"Response: {response}")
