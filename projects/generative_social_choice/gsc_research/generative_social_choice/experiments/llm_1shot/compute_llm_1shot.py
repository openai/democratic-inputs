# Standard library imports
import os
import sys
import traceback

# Third-party imports
import pandas as pd
from ast import literal_eval
import ipdb

# Local imports
from generative_social_choice.utils.helper_functions import (
    get_base_dir_path,
    get_time_string,
)

from generative_social_choice.experiments.jr_and_ejr_eval.jr_and_ejr_eval import (
    get_agents_from_experiment_type,
    get_query2_prompt_type_from_experiment_type,
)
from generative_social_choice.objects.agents import DEFAULT_MODEL
from generative_social_choice.objects.agreement_graph import create_agreement_graph
from generative_social_choice.objects.moderators import JRModerator

import argparse


def parse_arguments():
    """
    Parse command line arguments.
    :return: Argument object
    """
    parser = argparse.ArgumentParser(
        description="Run and evaluate LLM 1-shot experiments."
    )

    parser.add_argument(
        "--dataset-name", default="minimumwage", help="Name of the dataset."
    )
    parser.add_argument("--seed", type=int, default=0, help="Seed for reproducibility.")
    parser.add_argument("--k", type=int, default=5, help="Value of k.")
    parser.add_argument(
        "--prompt-type",
        default="output_anything",
        help="Type of prompt to use for the LLM 1-shot query.",
    )
    parser.add_argument(
        "--log-dir-name",
        default="experiments/llm_1shot/",
        help="Directory to log results.",
    )
    parser.add_argument(
        "--num-repetitions",
        type=int,
        default=20,
        help="Number of experiment repetitions.",
    )

    parser.add_argument(
        "--model",
        type=str,
        default=DEFAULT_MODEL,
        help="Model to use for LLM 1-shot query",
    )

    parser.add_argument(
        "--query2_model",
        type=str,
        default=DEFAULT_MODEL,
        help="Model to use for query 2 (to check approval of LLM generated slate)",
    )

    return parser.parse_args()


def run(*, dataset_name, seed, k, prompt_type, model, query2_model, log_dir_name):
    #### Get agents
    query2_prompt_type = get_query2_prompt_type_from_experiment_type(
        experiment_type=dataset_name
    )
    agents = get_agents_from_experiment_type(
        experiment_type=dataset_name,
        seed=seed,
        query2_model=query2_model,
        query2_prompt_type=query2_prompt_type,
    )
    ### Set up logs
    seed_str = f"seed_{seed}" if seed is not None else ""
    full_log_dir_name = (
        get_base_dir_path()
        / log_dir_name
        / f"{get_time_string()}__{dataset_name}__{seed_str}__llm_1_shot__{prompt_type}__{k}"
    )
    os.mkdir(full_log_dir_name)
    log_filename = str(full_log_dir_name / "logs.csv")
    raw_logs = []
    #### run Query1 1-shot
    moderator = JRModerator(id=0, model=model, prompt_type=prompt_type)
    _, jr_full_output = moderator.find_jr(agents=agents, k=k)
    # Log query1
    raw_logs.append(jr_full_output)
    pd.DataFrame(raw_logs).to_csv(log_filename)

    if prompt_type == "output_anything":
        generated_comments = jr_full_output["response"]
    else:
        raise NotImplementedError("haven't done output_subset yet")

    ### Compute agreement graph and store in dir

    graph = create_agreement_graph(
        agents=agents,
        comments=generated_comments,
        query2_prompt_type=query2_prompt_type,
        query2_model=query2_model,
        dataset_name="climate_change" if dataset_name == "changemyview" else "polis",
        issue="15-per-hour-seattle"
        if dataset_name == "minimumwage"
        else "american-assembly.bowling-green"
        if dataset_name == "bowlinggreen"
        else "",
        base_graph_dir=full_log_dir_name,
    )

    print("Success")
    return


if __name__ == "__main__":
    args = parse_arguments()

    try:
        for rep_num in range(args.num_repetitions):
            try:
                print(f"Starting run {rep_num}...")
                run(
                    dataset_name=args.dataset_name,
                    seed=args.seed,
                    k=args.k,
                    prompt_type=args.prompt_type,
                    log_dir_name=args.log_dir_name,
                    model=args.model,
                    query2_model=args.query2_model,
                )
            except Exception as e:
                raise e

    except:
        extype, value, tb = sys.exc_info()
        traceback.print_exc()
        ipdb.post_mortem(tb)
