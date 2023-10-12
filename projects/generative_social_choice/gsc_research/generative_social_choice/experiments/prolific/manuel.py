# %%
import pprint
import ast
from generative_social_choice.datasets.datasets import get_dataset
from generative_social_choice.utils.helper_functions import *
import numpy as np
from generative_social_choice.objects.abstract_agents import (
    Agent,
    DEFAULT_MODEL,
    GPTOutputParser,
)
from generative_social_choice.utils.gpt_wrapper import prompt_gpt

import pandas as pd

import generative_social_choice.utils.gpt_wrapper as gpt_wrapper


def load_prolific(experiment_name=None, step=None):
    dataset = get_dataset("prolific")
    df = dataset.load()

    if experiment_name is None:
        print(df.nunique())
        print(df.groupby('experiment_name').nunique()['user_id'])
    else:
        df = df[df['experiment_name'] == experiment_name]

    if step is None:
        question = df[['step', 'question_text_parsed']].drop_duplicates()
        dfprint(question, max_col_width=80)
    else:
        df = df[df['step'] == step].set_index('user_id')

    df_all_cols = df.copy()
    df = df[['question_text_parsed', 'text',
             'json_choices', 'choice', 'experiment_name']]
    return df, df_all_cols


class GPTLogger:
    def __init__(self,
                 *,
                 llm_model="GPT-4-base",
                 prompt_template,
                 **model_params):

        self.llm_model = llm_model
        self.prompt_template = prompt_template
        self.model_params = model_params

        if llm_model != "GPT-4-base":
            raise NotImplementedError

    def ask_question(self, **prompt_args):

        prompt = self.prompt_template.format(**prompt_args)
        response, completion = gpt_wrapper.prompt_gpt_base(prompt=prompt, **self.model_params)

        log = {
            "llm_model": self.llm_model,
            "model_params": self.model_params,
            "prompt_template": self.prompt_template,
            "prompt_args": prompt_args,
            "prompt": prompt,
            "response": response,
            "completion": completion,
        }

        return response, log


experiment_name = 'chatbot_personalization_eval_23_09_28'
step = 7
df, _ = load_prolific(experiment_name=experiment_name, step=step)

responses = list(df['text'])
responses_str = str(responses)

question = "To what extent should chatbots, such as ChatGPT, be personalized?"


# dfprint(responses[['text']], max_rows=None, max_col_width=100)
# responses_str = bullet_list_to_string_pretty(responses.values.squeeze())

# wprint(responses_str)

main_points_prompt = """
We asked a group of {n} people the following question: 
"{question}"

The following list (in Python format) contains the responses: 


{responses}


As a summary, I will now extract the {k} distinct arguments raised most frequently by this group of people. Each argument is a single, independent aspect of the problem. I will write each argument as a precise, coherent, and self-contained statement that includes a justification. Here are these {k} main arguments, formatted as a Python dictionary where the keys are suitable labels, such that you can directly parse what I wrote into a Python dictionary using literal_eval:

"""

logs = pd.read_csv('manuel_log.csv')

llm = GPTLogger(prompt_template=main_points_prompt,
                temperature=0,
                max_tokens=500,
                top_p=1,
                frequency_penalty=0,
                presence_penalty=0,
                logprobs=5,
                stop=["}"])

arguments, log = llm.ask_question(n=len(responses),
                                 k=6,
                                 question=question,
                                 responses=responses)
log = pd.DataFrame([log])
logs = pd.concat([logs, log])
logs.to_csv('manuel_log.csv', index=False)

arguments_dict = ast.literal_eval(arguments + '}')
pprint.pprint(arguments_dict)

# %%
contained_prompt = """
We asked a survey participant the following question: 
"{question}"

The following is the response by the participant:


"{response}"


Further, here is a list of arguments (formatted as a python dict) that are commonly made regarding that question:


{arguments}



I will now check which of these arguments the participant made in the response. I will write the response as a python dict, where the keys are identical to the keys in the dict above, and the values are either "contained" or "not contained", indicating whether the respective argument is contained in the response of the participant. Here is this python dict, formatted such that you can parse it using literal_eval:

"""

logs = pd.read_csv('manuel_log.csv')

llm = GPTLogger(prompt_template=contained_prompt,
                temperature=0,
                max_tokens=500,
                top_p=1,
                frequency_penalty=0,
                presence_penalty=0,
                logprobs=5,
                stop=["}"])

response = responses[4]
contained, log = llm.ask_question(question=question,
                                 response=response,
                                 arguments=arguments)
log = pd.DataFrame([log])
logs = pd.concat([logs, log])
logs.to_csv('manuel_log.csv', index=False)

contained_dict = ast.literal_eval(contained + '}')
pprint.pprint(contained_dict)


contained_df = pd.DataFrame([arguments_dict, contained_dict], 
                            index=['argument description', response])

dfprint(contained_df)


# %%
dfprint(logs[['prompt_template', 'response', 'model_params']])


# %%


# %%
# n = 10
some_responses = responses
prompt = main_points_prompt.format(n=len(some_responses),
                                   question=question,
                                   responses=some_responses)

wprint(prompt)
# %%

response, completion = gpt_wrapper.prompt_gpt_base(
    prompt,
    temperature=0,
    max_tokens=500,
    top_p=1,
    frequency_penalty=0,
    presence_penalty=0,
    logprobs=5,
    stop=["}"])

assert (len(completion.choices) == 1)
# wprint(response)
main_points = ast.literal_eval(response + '}')
pprint.pprint(main_points)


# %%
x = completion.choices[0]
print(x)


# %%
def extract_main_points():
    experiment_name = 'chatbot_personalization_eval_23_09_28'
    step = 7
    df, _ = load_prolific(experiment_name=experiment_name, step=step)

    responses = list(df['text'])
    responses_str = str(responses)

    question = "To what extent should chatbots, such as ChatGPT, be personalized?"

    # dfprint(responses[['text']], max_rows=None, max_col_width=100)
    # responses_str = bullet_list_to_string_pretty(responses.values.squeeze())

    # wprint(responses_str)

    prompt = """
We asked a group of {n} people the following question: 
"{question}"

The following list (in Python format) contains the responses: 


{responses}


Please extract the points raised most frequently this group of people. Be precise, include also the reasoning. As a response, give these points as a Python dictionary, where the keys are suitable labels. Write nothing else, no comment, only the dictionary."""

    prompt = prompt.format(n=len(responses),
                           question=question,
                           responses=responses)

    main_points_str = prompt_gpt(model="gpt-4-base", prompt=prompt)
    main_points = ast.literal_eval(main_points_str)

    # %%

    pprint.pprint(main_points)
    # wprint(main_points)
    # %%


# %%
def get_strong_responses(df):
    responses = list(df['text'])
    responses_str = str(responses)
    # dfprint(responses[['text']], max_rows=None, max_col_width=100)
    # responses_str = bullet_list_to_string_pretty(responses.values.squeeze())

    # wprint(responses_str)

    prompt = """
I have a list of strings in Python format. Each string contains a statement. I would like you to pick the four statements with the strongest opinions and clean up the writing, but only minimal edits. As ouput, please give me a list of the concise statements, in Python format, and nothing else, no comment, only the list. Here is the list:

{responses}""".format(responses=responses_str)

    concise_responses_str = prompt_gpt(model=DEFAULT_MODEL, prompt=prompt)
    concise_responses = ast.literal_eval(concise_responses_str)

    wprint(concise_responses)

    return concise_responses


# %%
def get_concise_responses(df):
    responses = list(df['text'])

    prompt_template = """
Please make the following statement more concise, and only return the concise statement and nothing else:

"{statement}"
"""

    concise_responses = []
    i = 0
    for response in responses:
        print(i)
        i = i + 1
        prompt = prompt_template.format(statement=response)
        concise_responses += [prompt_gpt(model=DEFAULT_MODEL, prompt=prompt)]

    wprint(concise_responses)
    return concise_responses


# %%


# some prompts =================================================================

# new prompt -------------------------------
prompt = """
The output of this survey is a summary of participants' opinions regarding the following question:

*"{question}"*

This summary will help decision-makers take action. How satisfied would you be if we used the following statement to represent *your* opinion?

*"{statement}"*

Please pick one of the following options:

4: I am completely satisfied, there is nothing I'd like change.
3: I would be satisfied with minor changes.
2: I would be satisfied with substantial changes.
1: This statement does not reflect my opinion at all.

Please explain the reasoning behind your choice. Which parts of this statement do you agree / disagree with, and why? Are there important points that are missing? Are there other improvements you suggest? Please try to be as specific as possible.
"""


statements = [
    "Skynet should never be a real thing. Personalization of AI would lead to the downfall of mankind. I feel AI should be as vague as possible to avoid issues oftakeover.",
    "It's crucial to balance personalization and privacy, allowing users control over chatbot memory settings to ensure data safety, according to individual preferences and security concerns.",
    "Personalization in chatbots can improve user experience, but tech companies' misuse of personal data for invasive investigations and targeted advertising raises privacy concerns. To protect our rights and maintain privacy, we may need to accept less efficient chatbots as a necessary compromise.",
    "Chatbots can improve user experience by tailoring responses to previous preferences, but they should remain morally neutral and unbiased to prevent exacerbating 'fake news' and credibility issues."
]

# older stuff ------------------------------
# %%


dividing_prompt = """
A group of people was surveyed regarding he personalization of Chatbots. In the following I will provide you with a list of comments, each made by a different person. Please write a statement, just a single sentence, that would be extremely divisive for this group, meaning that about half of the group would hate the statement and the other half would love the statement. Here is the list of comments made by the members of the group:


{comments}"""


unifying_prompt = """
A group of people was surveyed regarding he personalization of Chatbots. In the following I will provide you with a list of comments, each made by a different person. Please write a statement of three sentences, representing the dominant opinion of the group as accurately as possible. Note that not necessarily everyone needs to agree with the statement. Please formulate this statement as if you were one of the participants expressing their own opinion, not a summary, staring with "I ". Here is the list of comments made by the members of the group:


{comments}"""
