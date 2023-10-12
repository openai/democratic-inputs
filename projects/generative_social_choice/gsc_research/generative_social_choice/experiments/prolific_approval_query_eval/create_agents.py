from generative_social_choice.datasets.datasets import get_dataset
from generative_social_choice.objects.agents import CardinalFewShotAgent, CardinalAgent
from ast import literal_eval
from typing import List
import re

dataset = get_dataset("prolific")


def get_relevant_step_nums(*, experiment_name):
    if (
        experiment_name == "chatbot_personalization_rating_23_09_25"
        or experiment_name == "chatbot_personalization_rating_23_09_27"
    ):
        return [8, 10, 12, 14]
    elif experiment_name == "chatbot_personalization_eval_23_09_28_strict":
        return [9, 11, 13, 15, 17, 19]
    else:
        raise NotImplementedError(f"Unknown experiment name {experiment_name}")


def get_agent_opinion_step_num(*, experiment_name):
    if experiment_name == "chatbot_personalization_rating_23_09_27":
        return 15  # it's step 15
    elif experiment_name == "experiment1":
        return 7
    else:
        raise NotImplementedError


def process_question_text(*, experiment_name, question):
    if (
        experiment_name == "chatbot_personalization_rating_23_09_25"
        or experiment_name == "chatbot_personalization_rating_23_09_27"
    ):
        question_start_idx = question.index("How satisfied would you be")
        return question[question_start_idx:]
    elif experiment_name == "chatbot_personalization_eval_23_09_28_strict":
        return question
    else:
        raise NotImplementedError(f"Unknown experiment name {experiment_name}")


def extract_statement_from_question(*, experiment_name, question):
    if (
        experiment_name == "chatbot_personalization_eval_23_09_28"
        or experiment_name == "chatbot_personalization_eval_23_09_28_v2"
        or experiment_name == "chatbot_personalization_eval_23_09_28_strict"
    ):
        # Look for the text between quotes, that's the statement they're responding to
        match = re.search(r'"(.*?)"', question)
        if match:
            result = match.group(1)
            return result
        else:
            raise ValueError("no quotes")
    else:
        raise NotImplementedError(f"Unknown experiment name {experiment_name}")


def get_choices(experiment_name):
    """
    Warning: assumes all agents have the same choices
    """
    agent_ids = dataset.get_agent_ids()[experiment_name]
    agent_id = agent_ids[0]
    indiv_df = dataset.get_transcript_from_agent_id(agent_id)
    indiv_df = indiv_df[
        indiv_df["step"].isin(get_relevant_step_nums(experiment_name=experiment_name))
    ]
    choices = literal_eval(indiv_df["json_choices"].unique()[0])[::-1]
    return choices


def get_cardinal_agents(
    *, experiment_name: str, choices: List[str], query2_prompt_type: str = "cot"
) -> List[CardinalAgent]:
    """
    Given experiment_name and list of choices (ordered from Disagree to Agree), return a list of all CardinalAgents from that experiment.

    CardinalAgent just consists of agent_opinion (so a written paragraph from the agent) and the output of approval queries is one of the choices from choices.
    """
    agent_ids = dataset.get_agent_ids()[experiment_name]
    agents = []
    for agent_id in agent_ids:
        indiv_df = dataset.get_transcript_from_agent_id(agent_id)
        agent_opinion = indiv_df[
            indiv_df["step"]
            == get_agent_opinion_step_num(experiment_name=experiment_name)
        ]["text"].values[0]
        agents.append(
            CardinalAgent(
                id=agent_id,
                prompt_type=query2_prompt_type,
                agent_opinion=agent_opinion,
                choices=choices,
            )
        )
    return agents


def get_cardinal_fewshot_agents_without_test(
    experiment_name,
) -> List[CardinalFewShotAgent]:
    """
    Get one CardinalFewShotAgent per agent in the original dataset, where all the data from the experiment is put in the fewshot.

    Return:
    - list of CardinalFewShotAgents
    """
    agent_ids = dataset.get_agent_ids()[experiment_name]
    agents = []
    for agent_id in agent_ids:
        # Get data from that individual agent
        indiv_df = dataset.get_transcript_from_agent_id(agent_id)
        # Get the agent's overall opinion for query1
        agent_opinion = indiv_df[
            indiv_df["step"]
            == get_agent_opinion_step_num(experiment_name=experiment_name)
        ]["text"].values[0]
        # Get the vote data for the approval queries
        indiv_df = indiv_df[
            indiv_df["step"].isin(
                get_relevant_step_nums(experiment_name=experiment_name)
            )
        ]
        choices = literal_eval(indiv_df["json_choices"].unique()[0])[::-1]
        indiv_df["question"] = indiv_df["question_text_parsed"].apply(
            lambda question: process_question_text(
                experiment_name=experiment_name, question=question
            )
        )
        indiv_df = (
            indiv_df[["question", "text", "choice"]]
            .set_index("question")
            .rename({"text": "explanation"}, axis=1)
        )
        train_qa = indiv_df.to_dict("index")
        agent = CardinalFewShotAgent(
            id=agent_id,
            prompt_type="cot",
            train_qa=train_qa,
            test_q=None,
            agent_opinion=agent_opinion,
            choices=choices,
        )
        agents.append(agent)
    return agents


def _get_choices_and_choice_numbers(experiment_name, raw_choices):
    """
    Annoyingly, sometimes the choices are the text like "I agree" and other times the choices are nunmbers like "5". This returns both formats.

    Return:
    - choices, choice_numbers
    - choices is like ["totally disagree", ..., "Agree"]
    - choice_numbers is like [1, 2, 3, 4] or [0,1,2,3,4]
    """
    if experiment_name == "chatbot_personalization_rating_23_09_25":
        # Here, raw_choices are text.
        # We can put None for choice_numbers, it knows this default
        return raw_choices, None
    elif experiment_name == "chatbot_personalization_eval_23_09_28_strict":
        choices = [
            "This statement does not capture my opinion at all.",
            "Many important points are missing, requires substantial changes.",
            "It captures the most important points, requires only minor changes.",
            "It captures all important points.",
            "It completely captures my opinion.",
        ]
        choice_numbers = [0, 1, 2, 3, 4]
        return choices, choice_numbers


def get_cardinal_fewshot_agents(experiment_name):
    """
    Make a bunch of CardinalFewShotAgents from the original dataset. For each person from the original dataset, if they answered n questions,
    we make n agents out of them: n-1 are put as few-shot train examples and then the nth is the held out test question.

    Return:
    - dict with key agent, and value test_choice (i.e. the correct answer to test_q)
    """
    agent_ids = dataset.get_agent_ids()[experiment_name]
    agent_to_test_choice = dict()
    for agent_id in agent_ids:
        # Get data from that individual agent
        indiv_df = dataset.get_transcript_from_agent_id(agent_id)
        indiv_df = indiv_df[
            indiv_df["step"].isin(
                get_relevant_step_nums(experiment_name=experiment_name)
            )
        ]
        raw_choices = literal_eval(indiv_df["json_choices"].unique()[0])[::-1]
        choices, choice_numbers = _get_choices_and_choice_numbers(
            experiment_name, raw_choices
        )
        indiv_df["question"] = indiv_df["question_text_parsed"].apply(
            lambda question: process_question_text(
                experiment_name=experiment_name, question=question
            )
        )
        indiv_df = (
            indiv_df[["question", "text", "choice"]]
            .set_index("question")
            .rename({"text": "explanation"}, axis=1)
        )

        # For each choice of test_q, create a new agent
        for idx, test_q in enumerate(indiv_df.index):
            test_choice = indiv_df.loc[test_q]["choice"]
            train_qa = indiv_df.drop(test_q).to_dict("index")
            agent = CardinalFewShotAgent(
                id=f"{agent_id}_{idx}",
                prompt_type="cot",
                train_qa=train_qa,
                test_q=test_q,
                choices=choices,
                choice_numbers=choice_numbers,
            )
            # Sometimes, test_choice is lie "2", and other times it's like "Strongly disagree". Convert to text.
            try:
                test_choice = int(test_choice)
            except ValueError:
                # test_choice is a str, not an int
                test_choice = choices.index(test_choice) + 1
            agent_to_test_choice[agent] = test_choice
    return agent_to_test_choice


def text_prompt_from_agent(agent, END_PROMPT_NUMBER=42069):
    """
    Given a CardinalFewshotAgent, create a simple fewshot prompt suitable for gpt-4-base.

    This propmt has a bunch of examples of approval queries, and ends with 'choice_number':
    So we expect the next token to be a space character, and the one after that to be the integer choice.
    """
    prompt_dict = dict()
    questions = list(agent.train_qa.keys()) + [agent.test_q]
    for question in questions:
        prompt_dict[question] = dict()
        prompt_dict[question]["choices"] = agent.choices
        prompt_dict[question]["choice_numbers"] = list(range(1, len(agent.choices) + 1))
        if question != agent.test_q:
            prompt_dict[question]["choice_number"] = agent.train_qa[question][
                "choice_number"
            ]
            prompt_dict[question]["choice"] = agent.train_qa[question]["choice"]
            prompt_dict[question]["explanation"] = agent.train_qa[question][
                "explanation"
            ]
        else:
            prompt_dict[question]["choice_number"] = END_PROMPT_NUMBER
    prompt = str(prompt_dict).split(str(END_PROMPT_NUMBER))[0].rstrip()
    return prompt
