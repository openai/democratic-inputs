import ipdb
import traceback
import sys
import argparse
from generative_social_choice.objects.committee import generate_slate
from generative_social_choice.datasets.datasets import get_dataset
from generative_social_choice.objects.agents import CommentAgent, CMVSetup
from generative_social_choice.objects.abstract_agents import DEFAULT_MODEL
from generative_social_choice.objects.moderators import (
    Query1Moderator,
    Query1PrimeModerator,
    CMVQuery1Moderator,
    CMVQuery1PrimeModerator,
    Moderator,
)
from typing import Tuple
import random

MAX_NUM_AUTHORS = 20


def get_agents_from_experiment_type(
    experiment_type: str,
    query2_prompt_type: str,
    query2_model: str,
    seed=None,
) -> list:
    """
    Gets agents to run Query1/JR/EJR stuff from experiment type
    minimumwage: gets all agents who left at least one comment (just their comment, no vote data)
    bowlinggreen: samples MAX_NUM_AUTHORS people who left at least one comment
    changemyview: gets agents in df_test based on random seed
    """
    if experiment_type == "minimumwage" or experiment_type == "bowlinggreen":
        dataset = get_dataset("polis")
        issue = (
            "15-per-hour-seattle"
            if experiment_type == "minimumwage"
            else "american-assembly.bowling-green"
        )
        author_ids = dataset.get_good_author_ids(issue=issue)
        if len(author_ids) > MAX_NUM_AUTHORS:
            author_ids = random.sample(author_ids, MAX_NUM_AUTHORS)
        agents = []
        for author_id in author_ids:
            comments = dataset.get_comments_from_author_id(
                issue=issue, author_id=author_id
            )
            if len(comments) == 1:
                agents.append(
                    CommentAgent(
                        id=author_id,
                        comment=comments[0],
                        prompt_type=query2_prompt_type,
                        model=query2_model,
                    )
                )
    elif experiment_type == "changemyview":
        agents = CMVSetup.get_agents_from_seed(
            seed=seed, prompt_type=query2_prompt_type, model=query2_model
        )
    else:
        raise NotImplementedError(f"unrecognized experiment type {experiment_type}")
    return agents


def get_moderators_from_experiment_type(
    experiment_type: str,
    query1_model,
    query1_prime_model,
    query1_prompt_type,
    query1_prime_prompt_type,
    seed=None,
) -> Tuple[Moderator, Moderator]:
    """
    Returns Query1Moderator, Query1PrimeModerator for that experiment type
    """
    if experiment_type == "minimumwage" or experiment_type == "bowlinggreen":
        query1_moderator = Query1Moderator(
            id=0, prompt_type=query1_prompt_type, model=query1_model
        )
        query1_prime_moderator = Query1PrimeModerator(
            id=0, prompt_type=query1_prime_prompt_type, model=query1_prime_model
        )
    elif experiment_type == "changemyview":
        query1_moderator = CMVQuery1Moderator(
            id=0, prompt_type=query1_prompt_type, model=query1_model, seed=seed
        )
        query1_prime_moderator = CMVQuery1PrimeModerator(
            id=0,
            prompt_type=query1_prime_prompt_type,
            model=query1_prime_model,
            seed=seed,
        )
    else:
        raise NotImplementedError(f"unrecognized experiment type {experiment_type}")
    return query1_moderator, query1_prime_moderator


def get_query2_prompt_type_from_experiment_type(experiment_type: str) -> str:
    if experiment_type == "minimumwage" or experiment_type == "bowlinggreen":
        return "agree_disagree_best_guess_less_agree"
    elif experiment_type == "changemyview":
        return "cmv_basic"


def parse_arguments():
    parser = argparse.ArgumentParser(description="Run deliberation experiments")
    # Add arguments here
    return parser.parse_args()


def run(
    *,
    experiment_type,
    seed,
    k,
    algorithm_type,
    query1_prompt_type,
    query1_prime_prompt_type,
    query1_model,
    query1_prime_model,
    query2_model,
):
    query2_prompt_type = get_query2_prompt_type_from_experiment_type(
        experiment_type=experiment_type
    )
    agents = get_agents_from_experiment_type(
        experiment_type=experiment_type,
        seed=seed,
        query2_prompt_type=query2_prompt_type,
        query2_model=query2_model,
    )

    query1_moderator, query1_prime_moderator = get_moderators_from_experiment_type(
        experiment_type=experiment_type,
        query1_model=query1_model,
        query1_prompt_type=query1_prompt_type,
        query1_prime_model=query1_prime_model,
        query1_prime_prompt_type=query1_prime_prompt_type,
        seed=seed,
    )

    committee_members = generate_slate(
        algorithm_type=algorithm_type,
        agents=agents,
        query1_moderator=query1_moderator,
        query1_prime_moderator=query1_prime_moderator,
        k=k,
        experiment_type=experiment_type,
        log_dir_name=log_dir_name,
    )
    print("Final committtee: ")
    print(committee_members)


def parse_arguments():
    """Parses command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Run experiments for committee selection."
    )

    parser.add_argument(
        "--experiment_type",
        type=str,
        default="changemyview",
        choices=["minimumwage", "bowlinggreen", "changemyview"],
        help="Type of experiment to run. (default: changemyview)",
    )

    parser.add_argument(
        "--algorithm_type",
        type=str,
        default="JR",
        help="Algorithm type for the experiment. (default: JR)",
    )

    parser.add_argument(
        "--seed",
        type=int,
        default=0,
        help="Random seed for reproducibility. (default: 0)",
    )

    parser.add_argument(
        "--k",
        type=int,
        default=5,
        help="Number of committee members to select. (default: 5)",
    )

    parser.add_argument(
        "--query1_prompt_type",
        type=str,
        default="cmv_basic_no_fewshot_yes_cot",
        help="Query1 prompt type. (default: cmv_basic_no_fewshot_yes_cot)",
    )

    parser.add_argument(
        "--log_dir_name",
        type=str,
        default="experiments/jr_and_ejr_eval/",
        help="Directory to store logs. (default: experiments/jr_and_ejr_eval/)",
    )

    parser.add_argument(
        "--num_repetitions",
        type=int,
        default=9,
        help="Number of repetitions for the experiment. (default: 9)",
    )

    parser.add_argument(
        "--query1_model",
        type=str,
        default=DEFAULT_MODEL,
        help="Model to use for Query 1",
    )

    parser.add_argument(
        "--query1_prime_model",
        type=str,
        default=DEFAULT_MODEL,
        help="Model to use for Query1 prime",
    )

    parser.add_argument(
        "--query2_model",
        type=str,
        default=DEFAULT_MODEL,
        help="Model to use for approval queries",
    )

    return parser.parse_args()


if __name__ == "__main__":
    args = parse_arguments()

    # Using the parsed arguments
    experiment_type = args.experiment_type
    algorithm_type = args.algorithm_type
    seed = args.seed
    k = args.k
    query1_prompt_type = args.query1_prompt_type
    query1_prime_prompt_type = query1_prompt_type
    log_dir_name = args.log_dir_name
    NUM_REPETITIONS = args.num_repetitions
    query1_model = args.query1_model
    query1_prime_model = args.query1_prime_model
    query2_model = args.query2_model

    try:
        for rep_num in range(NUM_REPETITIONS):
            print(f"Starting run {rep_num}...")
            run(
                experiment_type=experiment_type,
                seed=seed,
                k=k,
                algorithm_type=algorithm_type,
                query1_prompt_type=query1_prompt_type,
                query1_prime_prompt_type=query1_prime_prompt_type,
                query1_model=query1_model,
                query1_prime_model=query1_prime_model,
                query2_model=query2_model,
            )
    except:
        extype, value, tb = sys.exc_info()
        traceback.print_exc()
        ipdb.post_mortem(tb)
