from generative_social_choice.experiments.prolific_approval_query_eval.create_agents import (
    get_cardinal_fewshot_agents,
    text_prompt_from_agent,
)
from generative_social_choice.datasets.datasets import get_dataset
from generative_social_choice.utils.helper_functions import get_time_string
import random
from pathlib import Path
import pandas as pd
from generative_social_choice.utils.gpt_wrapper import prompt_gpt_base

import sys
import traceback
import ipdb
import argparse
import os


def none_or_int(value):
    if value == "None":
        return None
    return value


def get_experiment_dirname(*, experiment_name, num_samples):
    return f"{get_time_string()}__{experiment_name}__{num_samples}"


def run(args):
    model = args.model
    experiment_name = args.experiment_name
    num_samples = int(args.num_samples) if args.num_samples is not None else None
    num_reps_per_agent = (
        int(args.num_reps_per_agent) if args.num_reps_per_agent is not None else None
    )

    agent_to_choice = get_cardinal_fewshot_agents(experiment_name)

    # Get agents
    agents = list(agent_to_choice.keys())
    if num_samples:
        assert len(agents) >= num_samples
        agents = random.sample(agents, num_samples)
    else:
        num_samples = len(agents)

    # For each agent, test approval query
    logs = []
    dirname = get_experiment_dirname(
        experiment_name=experiment_name, num_samples=num_samples
    )
    logs_filename = Path(dirname) / "logs.csv"

    os.mkdir(dirname)

    if model == "gpt-4" or model == "both":
        run_default_experiment(
            agents=agents,
            num_reps_per_agent=num_reps_per_agent,
            agent_to_choice=agent_to_choice,
            logs=logs,
            logs_filename=logs_filename,
        )
    elif model == "gpt-4-base" or model == "both":
        run_base_experiment(
            agents=agents,
            num_reps_per_agent=num_reps_per_agent,
            agent_to_choice=agent_to_choice,
            logs=logs,
            logs_filename=logs_filename,
        )
    else:
        raise ValueError(f"Unrecognized model {model}")


def run_base_experiment(
    *, agents, num_reps_per_agent, agent_to_choice, logs, logs_filename
):
    for idx, agent in enumerate(agents):
        for rep_num in range(num_reps_per_agent):
            print(
                f"Querying BASE agent {idx+1} out of {len(agents)}...(rep {rep_num+1}/{num_reps_per_agent})"
            )
            correct_choice = agent_to_choice[agent]
            prompt = text_prompt_from_agent(agent)
            temperature = 0 if num_reps_per_agent == 1 else 1
            response = prompt_gpt_base(
                prompt=prompt, max_tokens=2, temperature=temperature
            )
            try:
                choice_number = int(response[0])
            except Exception as _:
                choice_number = None
            logs.append(
                {
                    "id": agent.get_id(),
                    "time": get_time_string(),
                    "prompt": prompt,
                    "model": "gpt-4-base",
                    "correct_choice": correct_choice,
                    "choice_number": choice_number,
                }
            )
            logs_df = pd.DataFrame(logs)
            logs_df.to_csv(logs_filename)


def run_default_experiment(
    *, agents, num_reps_per_agent, agent_to_choice, logs, logs_filename
):
    for idx, agent in enumerate(agents):
        for rep_num in range(num_reps_per_agent):
            print(
                f"Querying agent {idx+1} out of {len(agents)}...(rep {rep_num+1}/{num_reps_per_agent})"
            )
            correct_choice = agent_to_choice[agent]
            choice, log_dict = agent.get_approval()  # using held out test_q
            # Log results
            logs.append(
                {**log_dict, "correct_choice": correct_choice, "choice_number": choice}
            )
            logs_df = pd.DataFrame(logs)
            logs_df.to_csv(logs_filename)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--experiment_name",
        type=str,
        choices=[
            "chatbot_personalization_rating_23_09_25",
            "chatbot_personalization_eval_23_09_28_strict",
        ],
        default="chatbot_personalization_rating_23_09_25",
        help="Experiment name",
    )

    parser.add_argument(
        "--num_samples",
        type=none_or_int,
        default=None,
        help="Number of vote prediction tasks to run",
    )

    parser.add_argument(
        "--num_reps_per_agent",
        type=int,
        default=1,
        help="Number of times to test the same agent",
    )

    parser.add_argument(
        "--model",
        choices=["gpt-4", "gpt-4-base", "both"],
        default="gpt-4",
        help="Which model to use, gpt-4 or gpt-4-base, or both.",
    )

    args = parser.parse_args()

    try:
        run(args)
    except:
        extype, value, tb = sys.exc_info()
        traceback.print_exc()
        ipdb.post_mortem(tb)
