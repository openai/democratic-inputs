from generative_social_choice.utils.helper_functions import (
    get_time_string,
    arg_name_to_full_name,
)
from generative_social_choice.objects.agents import get_polis_agent
import os
import pandas as pd
from pathlib import Path
import itertools
import random
import ipdb
import sys
import traceback
import re
from generative_social_choice.experiments.approval_query_eval.predict_polis_votes.helper_functions import (
    parse_response,
    polis_dataset,
)
from collections import Counter
from typing import Optional
from ast import literal_eval
import argparse


def get_relevant_agent_ids(*, issue, num_given_votes, num_given_comments):
    """
    Return list of all agent_ids who have at least num_given_votes+1 of each AGREE and DISAGREE votes (on good comments)
    and have at least num_given_comments comments."""
    assert num_given_votes % 2 == 0
    ### Check that agent has at least >= num_given_comments comments ###
    df = polis_dataset.load()
    df = df[
        (df["issue"] == polis_dataset.issue_to_natlang(issue))
        & (df["comment-id"].isin(polis_dataset.get_good_comment_ids(issue=issue)))
        & (df["author-id"].isin(polis_dataset.get_good_author_ids(issue=issue)))
    ]
    comment_counts = df.groupby("author-id")["comment-id"].count()
    agent_ids_with_suff_comments = comment_counts[
        comment_counts >= num_given_comments
    ].index.tolist()
    ### Check that agent has at least num_given_votes/2 +1 of each AGREE and DISAGREE votes
    relevant_agent_ids = []
    for agent_id in agent_ids_with_suff_comments:
        vote_data = polis_dataset.get_raw_vote_data_from_author_id(
            issue=issue, author_id=agent_id
        )
        filtered_vote_data = {
            comment_id: vote_data[comment_id]
            for comment_id in vote_data
            if comment_id
            not in polis_dataset.get_comment_ids_from_author_id(
                issue=issue, author_id=agent_id
            )
            and comment_id in polis_dataset.get_good_comment_ids(issue=issue)
        }
        counter = Counter(filtered_vote_data.values())
        if (
            counter[-1] >= (num_given_votes // 2) + 1
            and counter[1] >= (num_given_votes // 2) + 1
        ):
            relevant_agent_ids.append(agent_id)
    return relevant_agent_ids


def run_experiment(
    *,
    issue,
    num_given_comments,
    num_given_votes,
    model,
    query2_prompt_type,
    num_agents,
    num_agent_repetitions=2,
    name,
):
    assert num_agent_repetitions % 2 == 0
    assert num_given_votes % 2 == 0
    ### Set up directory for logging ###
    experiment_type = "vote_prediction_from_votes_and_comments"
    experiment_dirname = f"{get_time_string()}_{issue}_{query2_prompt_type}_{num_given_comments}_{num_given_votes}_{name}"
    os.mkdir(experiment_dirname)
    results = []
    logs = []
    results_df = pd.DataFrame()
    logs_df = pd.DataFrame()

    ### Sample experiments to run ####
    agent_ids = get_relevant_agent_ids(
        issue=issue,
        num_given_comments=num_given_comments,
        num_given_votes=num_given_votes,
    )

    print(f"Running experiment on {len(agent_ids)} different agents...")

    agents = []
    sampled_experiments = []

    if num_agents is None:
        num_agents = len(agent_ids)

    agent_ids_sample = random.sample(agent_ids, num_agents)

    for sample_num in range(num_agents):
        agent_id = agent_ids_sample[sample_num]

        for agent_repetition_num in range(num_agent_repetitions):
            ### Pick train data (what's going in prompt) ###

            # Pick writen comments to include
            written_comment_ids = set(
                polis_dataset.get_comment_ids_from_author_id(
                    issue=issue, author_id=agent_id
                )
            ).intersection(polis_dataset.get_good_comment_ids(issue=issue))

            written_comment_ids_sample = random.sample(
                list(written_comment_ids), num_given_comments
            )

            # Pick votes to include
            raw_vote_data = polis_dataset.get_raw_vote_data_from_author_id(
                issue=issue, author_id=agent_id
            )
            good_raw_vote_data = {
                key: raw_vote_data[key]
                for key in set(
                    polis_dataset.get_good_comment_ids(issue=issue)
                ).intersection(raw_vote_data.keys())
            }
            agree_comment_ids = [
                comment_id
                for comment_id in good_raw_vote_data
                if good_raw_vote_data[comment_id] == 1
            ]
            disagree_comment_ids = [
                comment_id
                for comment_id in good_raw_vote_data
                if good_raw_vote_data[comment_id] == -1
            ]
            agree_comment_ids_sample = random.sample(
                agree_comment_ids, num_given_votes // 2
            )
            disagree_comment_ids_sample = random.sample(
                disagree_comment_ids, num_given_votes // 2
            )
            voted_comment_ids_sample = (
                agree_comment_ids_sample + disagree_comment_ids_sample
            )

            agents.append(
                get_polis_agent(
                    issue=issue,
                    id=agent_id,
                    prompt_type=query2_prompt_type,
                    model=model,
                    voted_comment_ids=voted_comment_ids_sample,
                    written_comment_ids=written_comment_ids_sample,
                )
            )

            ### Pick test data (vote asked to be predicted) ###

            # Derandomize so that we are predicting 1/2 AGREE and 1/2 DISAGREE
            if agent_repetition_num % 2 == 0:
                true_vote = 1
            else:
                true_vote = -1
            if true_vote == 1:
                test_comment_id = random.choice(
                    list(
                        set(agree_comment_ids)
                        .difference(agree_comment_ids_sample)
                        .difference(written_comment_ids_sample)
                    )
                )
            else:
                test_comment_id = random.choice(
                    list(
                        set(disagree_comment_ids)
                        .difference(disagree_comment_ids_sample)
                        .difference(written_comment_ids_sample)
                    )
                )

            test_comment = polis_dataset.get_comment_from_id(
                issue=issue, comment_id=test_comment_id
            )

            sampled_experiments.append(
                {
                    "experiment_type": experiment_type,
                    "agent_id": agent_id,
                    "written_comment_ids_sample": written_comment_ids_sample,
                    "voted_comment_ids_sample": voted_comment_ids_sample,
                    "test_comment_id": test_comment_id,
                    "test_comment": test_comment,
                    "true_vote": true_vote,
                }
            )

    ### Run experiment ###

    for agent, experiment in zip(agents, sampled_experiments):
        print(f"Running {experiment}")
        test_comment = experiment["test_comment"]
        true_vote = experiment["true_vote"]
        _, response_obj = agent.get_approval(comment=test_comment)
        response_obj["llm_vote"] = parse_response(
            response=response_obj["response"],
            query2_prompt_type=query2_prompt_type,
        )
        response_obj = {
            **response_obj,
            **experiment,
            "num_given_comments": num_given_comments,
            "num_given_votes": num_given_votes,
        }
        logs.append(response_obj)
        results.append({**experiment, "llm_vote": response_obj["llm_vote"]})
        # Update dfs
        results_df = pd.DataFrame(results)
        logs_df = pd.DataFrame(logs)
        results_df.to_csv(Path(experiment_dirname) / "results.csv")
        logs_df.to_csv(Path(experiment_dirname) / "logs.csv")


def run(args):
    random.seed(1999)

    num_given_comments = args.num_given_comments
    num_given_votes = args.num_given_votes
    issue = arg_name_to_full_name(args.dataset)
    num_agents = args.num_agents
    name = args.name
    num_agent_repetitions = args.num_agent_repetitions
    query2_model = args.query2_model
    query2_prompt_type = args.query2_prompt_type

    run_experiment(
        issue=issue,
        num_given_comments=num_given_comments,
        num_given_votes=num_given_votes,
        model=query2_model,
        query2_prompt_type=query2_prompt_type,
        num_agents=num_agents,
        num_agent_repetitions=num_agent_repetitions,
        name=name,
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--dataset",
        type=str,
        default="minimumwage",
        help="Polis dataset (minimumwage or bowlinggreen)",
    )

    parser.add_argument(
        "--num-given-comments",
        type=int,
        default=1,
        help="Number of given comments in prompt",
    )

    parser.add_argument(
        "--num-given-votes",
        type=int,
        default=2,
        help="Number of given votes in prompt (must be even)",
    )

    parser.add_argument(
        "--num-agents",
        type=int,
        default=None,
        help="Number of agents. Use None for all agents",
    )
    parser.add_argument(
        "--num-agent-repetitions",
        type=int,
        default=20,
        help="Number of agent repetitions",
    )

    parser.add_argument(
        "--query2-prompt-type",
        type=str,
        default="agree_disagree_best_guess_less_agree",
        help="Query 2 prompt type",
    )
    parser.add_argument(
        "--query2-model",
        type=str,
        default="gpt-4-0314",
        help="Query 2 model",
    )

    parser.add_argument(
        "--name",
        type=str,
        default="unknown",
        help="Experiment name",
    )

    args = parser.parse_args()

    try:
        run(args)

    except:
        extype, value, tb = sys.exc_info()
        traceback.print_exc()
        ipdb.post_mortem(tb)
