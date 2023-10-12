from generative_social_choice.datasets.datasets import get_dataset
from generative_social_choice.objects.agents import (
    CommentAgent,
    Agent,
    CMVSetup,
)
from generative_social_choice.objects.moderators import (
    Query1Moderator,
    CMVQuery1Moderator,
)
from generative_social_choice.utils.helper_functions import (
    get_base_dir_path,
    get_time_string,
    arg_name_to_full_name,
)
from generative_social_choice.objects.agreement_graph import (
    AgreementGraph,
    create_symmetric_agreement_graph,
)
from generative_social_choice.objects.agent_helper_functions import (
    query2_output_implies_agreement,
)
import itertools
import os
import pandas as pd
import numpy as np
from pathlib import Path
import random
import sys
import traceback
import ipdb
from ast import literal_eval
import argparse
from typing import Optional


def create_or_load_agreement_graph(
    *, dataset_name, query2_model, query2_prompt_type, issue, num_agents
):
    """
    dataset_name: polis or climate_change
    issue: if polis, then 15-per-hour-seattle
           if climate change, then "seed_0" where 0 is seed

    """
    try:
        graph = AgreementGraph.load(
            dataset_name=dataset_name,
            issue=issue,
            query2_prompt_type=query2_prompt_type,
            query2_model=query2_model,
        )
        assert graph is not None
    except (ValueError, FileNotFoundError) as e:
        # No graph found -- generate an agreement graph
        dataset = get_dataset(dataset_name)
        if dataset_name == "polis":
            agents = []
            good_author_ids = dataset.get_good_author_ids(issue=issue)
            if issue == "15-per-hour-seattle":
                good_author_ids.append(0)
            for author_id in good_author_ids:
                for comment_id in dataset.get_comment_ids_from_author_id(
                    issue=issue, author_id=author_id
                ):
                    agents.append(
                        CommentAgent(
                            id=str((author_id, (comment_id,))),
                            comment=dataset.get_comment_from_id(
                                issue=issue, comment_id=comment_id
                            ),
                        )
                    )
            if num_agents is not None:
                sampled_agents = random.sample(agents, num_agents)
            else:
                sampled_agents = agents

            graph = create_symmetric_agreement_graph(
                agents=sampled_agents,
                query2_prompt_type=query2_prompt_type,
                query2_model=query2_model,
                dataset_name=f"{dataset_name}__{issue}",
            )
        elif dataset_name == "climate_change":
            if query2_prompt_type == "cmv_basic":
                seed = int(issue.replace("seed_", ""))
                agents = CMVSetup.get_agents_from_seed(seed=seed)

                graph = create_symmetric_agreement_graph(
                    agents=agents,
                    query2_prompt_type=query2_prompt_type,
                    query2_model=query2_model,
                    dataset_name=f"{dataset_name}__{issue}",
                )
        else:
            raise ValueError(f"dataset {dataset_name} not supported")
    return graph


def parse_arguments():
    """
    Parse command line arguments.
    :return: Argument object
    """
    parser = argparse.ArgumentParser(
        description="Script to run experiments based on various datasets."
    )

    parser.add_argument(
        "--dataset",
        type=str,
        required=True,
        help="Dataset (minimumwage, bowlinggreen, or changemyview).",
    )
    parser.add_argument(
        "--num-agents",
        type=int,
        default=None,
        help="Number of agents. Use None for all agents.",
    )
    parser.add_argument(
        "--query-sizes", type=str, required=True, help="List of query sizes to test."
    )
    parser.add_argument(
        "--num-samples", type=int, default=10, help="Number of samples per query size."
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=None,
        help="Random seed (required for changemyview).",
    )
    parser.add_argument(
        "--name",
        type=str,
        default="",
        help="Name for the experiment to label files with.",
    )

    return parser.parse_args()


def run(args):
    """
    Run the experiment based on the provided arguments.
    :param args: Argument object with experiment settings.
    """
    dataset = args.dataset
    num_agents = args.num_agents
    query1_sizes = literal_eval(args.query_sizes)
    num_samples = args.num_samples
    suffix = args.name
    query2_model = "gpt-4-0314"
    query1_model = "gpt-4-0314"
    if dataset == "changemyview":
        query2_prompt_type = "cmv_basic"
        query1_prompt_type = "cmv_basic"
        dataset_name = "climate_change"
        issue = args.seed
        seed = args.seed
        if issue is None:
            raise ValueError("Must provide seed for changemyview")
    elif dataset == "minimumwage" or dataset == "bowlinggreen":
        query2_prompt_type = "agree_disagree_best_guess_less_agree"
        query1_prompt_type = "basic_explain_common_ground"
        issue = arg_name_to_full_name(dataset)
        dataset_name = "polis"
    else:
        raise ValueError("invalid dataset")

    ############################################

    # create dir for logging
    experiment_dirname = (
        f"{get_time_string()}_{dataset_name}_{issue}_{query1_prompt_type}{suffix}"
    )
    os.mkdir(experiment_dirname)
    logs = []
    results = []

    if dataset_name == "polis":
        moderator = Query1Moderator(
            model=query1_model, id=0, prompt_type=query1_prompt_type
        )
    elif dataset_name == "climate_change":
        moderator = CMVQuery1Moderator(
            model=query1_model, seed=seed, id=0, prompt_type=query1_prompt_type
        )
    else:
        raise ValueError(f"unsupported dataset {dataset_name}")

    ###################################
    ## Create or load agreement graph

    graph = create_or_load_agreement_graph(
        dataset_name=dataset_name,
        query2_model=query2_model,
        query2_prompt_type=query2_prompt_type,
        issue=issue,
        num_agents=num_agents,
    )

    ###################################
    agent_id_to_agent = {str(agent.get_id()): agent for agent in graph.agents}
    agent_ids = list(agent_id_to_agent.keys())

    for query1_size in query1_sizes:
        print(f"Testing query1_size {query1_size}")
        for i in range(num_samples):
            print(f"Testing sample {i+1}/{num_samples}")
            # Have to sample indexes, rather than elements, since numpy doesn't like when agent_ids are nested tuples like (0,(12,))
            agent_id_sample = np.random.choice(
                agent_ids, size=query1_size, replace=False
            )
            # agent_id_sample_idx = np.random.choice(
            #     range(len(agent_ids)), size=query1_size, replace=False
            # )
            # agent_id_sample = [agent_ids[idx] for idx in agent_id_sample_idx]

            # Run Query 1
            query1_response, query1_full_output = moderator.query1(
                prompt_type=query1_prompt_type,
                agents=[agent_id_to_agent[agent_id] for agent_id in agent_id_sample],
            )
            query1_full_output["model"] = query1_model

            logs.append(
                {
                    **query1_full_output,
                    "query1_size": query1_size,
                    "agent_id_sample": agent_id_sample,
                    "query1_response": query1_response,
                }
            )
            logs_df = pd.DataFrame(logs)
            logs_df.to_csv(Path(experiment_dirname) / "logs.csv")

            # Calculate agent id sample approvals
            agent_id_to_num_approve = dict()
            for agent_id in agent_id_sample:
                comment = agent_id_to_agent[agent_id].get_comment()
                df = graph.df[comment]  # select columns
                if (
                    "(" in agent_id_sample[0]
                ):  # indices are tuples like "(1, (21,))", and pandas needs these to stay strings
                    df = df.loc[df.index.isin(agent_id_sample)]
                else:  # indices are ints, need to convert from int to string sometimes
                    df = df.loc[
                        graph.df.index.isin(map(int, agent_id_sample))
                    ]  # select rows
                agent_id_to_num_approve[agent_id] = len(df[df == 1])

            agent_id_sample_approvals = [
                agent_id_to_num_approve[agent_id] for agent_id in agent_id_sample
            ]

            # Calculate query1 approval
            agent_ids_approve_query1 = []

            for agent_id in agent_id_sample:
                agent = agent_id_to_agent[agent_id]
                _, output = agent.get_approval(comment=query1_response)

                output["agent_comment"] = agent_id_to_agent[agent_id].get_comment()

                logs.append(output)
                logs_df = pd.DataFrame(logs)
                logs_df.to_csv(Path(experiment_dirname) / "logs.csv")
                if query2_output_implies_agreement(
                    query2_output=output["response"].lower(),
                    query2_prompt_type=query2_prompt_type,
                ):
                    agent_ids_approve_query1.append(agent_id)

            key_data = {
                "query1_size": query1_size,
                "agent_id_sample": agent_id_sample,
                "agent_id_sample_approvals": agent_id_sample_approvals,
                "max_approval": max(agent_id_sample_approvals),
                "query1_response": query1_response,
                "agent_id_approve_query1": agent_ids_approve_query1,
                "query1_approval": len(agent_ids_approve_query1),
            }
            results.append(key_data)
            results_df = pd.DataFrame(results)
            results_df.to_csv(Path(experiment_dirname) / "results.csv")


if __name__ == "__main__":
    args = parse_arguments()

    try:
        run(args)
    except:
        extype, value, tb = sys.exc_info()
        traceback.print_exc()
        ipdb.post_mortem(tb)
