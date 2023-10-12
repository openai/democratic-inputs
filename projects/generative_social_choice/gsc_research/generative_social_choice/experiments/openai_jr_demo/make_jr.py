from generative_social_choice.datasets.datasets import get_dataset
from generative_social_choice.objects.agents import CardinalAgent
from generative_social_choice.objects.committee import generate_slate
from generative_social_choice.objects.moderators import (
    MultiLevelQuery1Moderator,
    PolarizeModerator,
)
from generative_social_choice.experiments.prolific_approval_query_eval.create_agents import (
    get_cardinal_fewshot_agents_without_test,
    get_cardinal_agents,
)
from generative_social_choice.experiments.prolific_approval_query_eval.create_agents import (
    get_choices as get_choices_from_experiment_name,
)
from generative_social_choice.utils.gpt_wrapper import prompt_gpt


import sys
import traceback
import ipdb
import argparse
import os

from typing import List, Optional, Literal


def none_or_int(value):
    if value == "None":
        return None
    return value


def get_choices(num_choices: int, experiment_name: Optional[str] = None) -> List[str]:
    if experiment_name is not None:
        return get_choices_from_experiment_name(experiment_name)
    else:
        if num_choices == 4:
            return [
                "This statement does not reflect my opinion at all.",
                "I would be satisfied with substantial changes.",
                "I would be satisfied with minor changes.",
                "I am completely satisfied, there is nothing I'd like change.",
            ]
        elif num_choices == 8:
            return [
                "This statement is garbage, it's completely opposite to my opinions.",
                "This statement does not reflect my opinions at all.",
                "I mostly disagree with the statement, but it has a little bit that rings true.",
                "Half of the statement seems fine, the other half I disagree with.",
                "I mostly agree, but I'd want to make quite a few changes to the statement.",
                "I think this statement mostly has it right, but it's missing this aspect of my opinion.",
                "This statement almost precisely mirrors my opinion, it's just slightly off.",
                "This perfectly encapsulates what I believe on this topic, just in different words.",
            ]


def run(args):
    algorithm_type = args.algorithm_type
    experiment_name = args.experiment_name
    moderator_type = args.moderator_type
    query1_prompt_type = args.query1_prompt_type
    num_choices = args.num_choices
    k = args.k

    # Get agents
    if experiment_name == "experiment1":
        choices = get_choices(num_choices=num_choices)
        agents = get_cardinal_agents(experiment_name=experiment_name, choices=choices)
    elif experiment_name == "chatbot_personalization_rating_23_09_27":
        choices = get_choices(num_choices=num_choices, experiment_name=experiment_name)
        agents = get_cardinal_fewshot_agents_without_test(
            experiment_name=experiment_name
        )
    else:
        raise ValueError(f"Unknown experiment name {experiment_name}")

    n = len(agents)
    num_choices = len(choices)

    # Get moderators
    if moderator_type == "basic":
        moderator = MultiLevelQuery1Moderator(
            id=0, prompt_type=query1_prompt_type, approval_level=5
        )
    elif moderator_type == "polarize":
        moderator = PolarizeModerator(
            id=0, prompt_type=query1_prompt_type, cluster_size=n // k
        )
    else:
        raise ValueError("Unknown moderator type {moderator_type}")

    # Compute slate

    dirname = f"{num_choices}app_level__{experiment_name}__{moderator_type}"

    committee_supporters = generate_slate(
        algorithm_type=algorithm_type,
        agents=agents,
        query1_moderator=moderator,
        query1_prime_moderator=None,
        k=k,
        experiment_type=dirname,  # this is just the name of the logs directory
        log_dir_name="experiments/openai_jr_demo/",
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--algorithm_type",
        choices=["JR", "BalancedJR"],
        type=str,
        required=True,
        help="Which kind of slate to generate. JR does standard greedy JR. BalancedJR only adds n/k people in every greedy step.",
    )

    parser.add_argument(
        "--num_choices",
        type=none_or_int,
        help="Number of levels of approval. Leave blank unless using experiment1 data (if we have fewshot votes, just use that system).",
    )

    parser.add_argument(
        "--experiment_name",
        choices=[
            "experiment1",
            "chatbot_personalization_rating_23_09_27",
        ],
        required=True,
        type=str,
        help="Which experiment dataset to use.\-experiment1: Only have agent opinions, no multi-level votes. So just use basic moderator\n-23_09_27: This has both multi-level votes and agent opinions.",
    )

    parser.add_argument(
        "--moderator_type",
        choices=["basic", "polarize"],
        type=str,
        required=True,
        help="Moderator type to use. 'basic' uses a MultiLevelQuery1Moderator, which is close to our standard Query1. 'polarize' uses PolarizeModerator, which asks for hotter takes.",
    )

    parser.add_argument(
        "--query1_prompt_type",
        choices=[
            "basic_cot",
            "nothalf_cot",
            "fixed_cluster_size_cot",
            "fixed_cluster_size_simple_cot",
            "fixed_cluster_size_more_explanation_cot",
        ],
        type=str,
        required=True,
        help="Prompt to use for Query1. If using 'basic' moderator, then pick 'basic_cot'. If using 'polarize', then pick 'nothalf_cot' or 'fixed_cluster_size_cot' or 'fixed_cluster_size_simple_cot' or 'fixed_cluster_size_more_explanation_cot'.",
    )

    parser.add_argument("--k", type=int, required=True, help="Slate size to generate.")

    args = parser.parse_args()

    try:
        run(args)
    except:
        extype, value, tb = sys.exc_info()
        traceback.print_exc()
        ipdb.post_mortem(tb)
