from generative_social_choice.objects.agents import CMVSetup
import random
from generative_social_choice.utils.helper_functions import get_time_string
import pandas as pd
import os
import re
from pathlib import Path
import sys
import traceback
import ipdb
import argparse
from generative_social_choice.datasets.datasets import get_dataset
from typing import Optional
from ast import literal_eval


def parse_response(*, response, query2_prompt_type):
    response = re.sub("[^a-zA-Z]+", "", response)
    parsed_response = None
    if query2_prompt_type == "cmv_basic":
        if response.lower() == "yes":
            parsed_response = 1
        elif response.lower() == "no":
            parsed_response = -1
        return parsed_response
    else:
        raise NotImplementedError("don't know how to parse this response into vote int")


def run_experiment(
    *, seed, num_agents, num_agent_repetitions, name, query2_prompt_type, query2_model
):
    assert num_agent_repetitions % 2 == 0
    #####################
    ## Set up logging
    ######################
    experiment_dirname = f"{get_time_string()}_{query2_prompt_type}_{seed}_{name}"
    os.mkdir(experiment_dirname)
    results = []
    logs = []
    results_df = pd.DataFrame()
    logs_df = pd.DataFrame()
    ######################
    ### Get agents
    ######################
    dataset = get_dataset("climate_change")
    all_agents = CMVSetup.get_agents_from_seed(
        seed=seed, prompt_type=query2_prompt_type, model=query2_model
    )
    if num_agents == None:
        num_agents = len(all_agents)
    elif num_agents > len(all_agents):
        raise ValueError(f"num_agents exceeds number of agents {len(all_agents)}")
    sampled_agents = random.sample(all_agents, num_agents)
    #######################
    #### Run experiment
    #####################
    for agent in sampled_agents:
        print(f"Querying agent {agent.get_id()}...")
        for agent_repetition_num in range(num_agent_repetitions):
            ###### n.b: Train data is already in prompt, fixed by random seed
            ###### Pick test data
            if agent_repetition_num % 2 == 0:
                true_vote = 1
            else:
                true_vote = -1

            vote_data = agent.get_vote_data()  # this is a dict {comment : vote}

            comments_with_matching_vote = [
                comment for comment in vote_data if vote_data[comment] == true_vote
            ]

            test_comment = random.choice(comments_with_matching_vote)

            experiment_params = {
                "true_vote": true_vote,
                "test_comment": test_comment,
                "agent_id": agent.get_id(),
                "agent_comment": agent.get_comment(),
                "seed": seed,
            }

            ###### Run satisfaction query

            _, response_obj = agent.get_approval(comment=test_comment)

            response_obj["llm_vote"] = parse_response(
                response=response_obj["response"], query2_prompt_type=query2_prompt_type
            )

            response_obj = {
                **response_obj,
                **experiment_params,
            }

            logs.append(response_obj)
            results.append({**experiment_params, "llm_vote": response_obj["llm_vote"]})
            # Update dfs
            results_df = pd.DataFrame(results)
            logs_df = pd.DataFrame(logs)
            results_df.to_csv(Path(experiment_dirname) / "results.csv")
            logs_df.to_csv(Path(experiment_dirname) / "logs.csv")


def run(args):
    ######################
    ### Basic parameters
    #####################
    seeds = literal_eval(args.seeds)
    num_agents = args.num_agents
    num_agent_repetitions = args.num_agent_repetitions
    query2_prompt_type = args.query2_prompt_type
    query2_model = args.query2_model
    name = args.name

    for seed in seeds:
        run_experiment(
            seed=seed,
            num_agents=num_agents,
            num_agent_repetitions=num_agent_repetitions,
            name=name,
            query2_prompt_type=query2_prompt_type,
            query2_model=query2_model,
        )


def none_or_int(value):
    if value == "None":
        return None
    return value


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--seeds",
        type=str,
        default="[0, 1, 2, 3, 4]",
        help='Seeds for experiment (default: "[0,1,2,3,4]")',
    )
    parser.add_argument(
        "--num-agents",
        type=none_or_int,
        default=None,
        help="Number of agents (default: None). Use None for all agents",
    )
    parser.add_argument(
        "--num-agent-repetitions",
        type=int,
        default=20,
        help="Number of agent repetitions (default: 20)",
    )
    parser.add_argument(
        "--query2-prompt-type",
        type=str,
        default="cmv_basic",
        help="Query 2 prompt type (default: cmv_basic)",
    )
    parser.add_argument(
        "--query2-model",
        type=str,
        default="gpt-4-0314",
        help="Query 2 model (default: gpt-4-0314)",
    )
    parser.add_argument(
        "--name",
        type=str,
        default="unknown",
        help="Experiment name (default: unknown)",
    )

    args = parser.parse_args()
    if not isinstance(literal_eval(args.seeds), list):
        print("Error: 'seeds' argument should be a list")
        sys.exit(1)

    try:
        run(args)

    except:
        extype, value, tb = sys.exc_info()
        traceback.print_exc()
        ipdb.post_mortem(tb)
