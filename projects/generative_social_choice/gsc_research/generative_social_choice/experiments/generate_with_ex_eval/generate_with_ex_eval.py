import ipdb
import traceback
import sys
import os

from generative_social_choice.objects.agents import DEFAULT_MODEL
from generative_social_choice.objects.moderators import (
    Query1Moderator,
    Query1PrimeModerator,
)
import random
from generative_social_choice.experiments.jr_and_ejr_eval.jr_and_ejr_eval import (
    get_agents_from_experiment_type,
    get_query2_prompt_type_from_experiment_type,
    get_moderators_from_experiment_type,
)
from generative_social_choice.utils.helper_functions import (
    get_base_dir_path,
    get_time_string,
    arg_name_to_full_name,
)
import pandas as pd
from generative_social_choice.objects.agreement_graph import create_agreement_graph
import argparse

MAX_NUM_AUTHORS = 20


def run_experiment(
    *,
    experiment_type,
    seed,
    max_depth,
    query2_model,
    log_dir_name,
    query1_moderator,
    query1_prime_moderator,
):
    ## Set up logging
    seed_str = f"seed_{seed}" if seed is not None else ""
    full_log_dir_name = (
        get_base_dir_path()
        / log_dir_name
        / f"{get_time_string()}__{experiment_type}__{seed_str}__query1prime__{query1_moderator.prompt_type}__{query1_prime_moderator.prompt_type}__{max_depth}"
    )
    os.mkdir(full_log_dir_name)
    log_filename = str(full_log_dir_name / "logs.csv")
    raw_logs = []

    #### STEP 1: run query1 (and query1') max_depth times

    ## Get agents for experiment
    agents = get_agents_from_experiment_type(
        experiment_type=experiment_type,
        seed=seed,
        query2_prompt_type=get_query2_prompt_type_from_experiment_type(experiment_type),
        query2_model=query2_model,
    )

    generated_comments = []
    for current_depth in range(max_depth):
        query1_type = ""
        if current_depth == 0:
            query1_type = "query1"
            _, query1_full_output = query1_moderator.query1(agents=agents)
        else:
            query1_type = "query1_prime"
            _, query1_full_output = query1_prime_moderator.query1_prime(
                agents=agents,
                excluded_comments=generated_comments,
            )
        # Log query1
        raw_logs.append(
            {
                **query1_full_output,
                "query_type": query1_type,
                "current_depth": current_depth,
                "max_depth": max_depth,
            }
        )
        pd.DataFrame(raw_logs).to_csv(log_filename)

        # Add query1 response to committee
        query1_response = query1_full_output["response"]
        print(f"{query1_type} response: {query1_response}")
        generated_comments.append(query1_response)

    # Log final committee to txt file
    with open(full_log_dir_name / "generated_comments.txt", "w") as f:
        f.write(str(generated_comments))

    ### STEP 2: compute agreement graph and also log in folder

    graph = create_agreement_graph(
        agents=agents,
        comments=generated_comments,
        query2_prompt_type=get_query2_prompt_type_from_experiment_type(
            experiment_type=experiment_type
        ),
        query2_model=DEFAULT_MODEL,
        dataset_name="climate_change" if experiment_type == "changemyview" else "polis",
        issue="15-per-hour-seattle"
        if experiment_type == "minimumwage"
        else "american-assembly.bowling-green"
        if experiment_type == "bowlinggreen"
        else "",
        base_graph_dir=full_log_dir_name,
    )

    return graph


def run(args):
    dataset = args.dataset
    max_depth = args.max_depth
    num_repetitions = args.num_repetitions
    query1_model = args.query1_model
    query1_prime_model = args.query1_prime_model
    query2_model = args.query1_model
    log_dir_name = "experiments/generate_with_ex_eval"
    if dataset == "changemyview":
        query1_prime_prompt_type = "cmv_basic"
        query1_prompt_type = "cmv_basic"
    elif dataset == "minimumwage" or dataset == "bowlinggreen":
        query1_prime_prompt_type = "basic_explain_common_ground"
        query1_prompt_type = "basic_explain_common_ground"
    else:
        raise ValueError("invalid dataset")

    for rep_num in range(num_repetitions):
        seed = random.choice(range(1000)) if dataset == "changemyview" else None

        query1_moderator, query1_prime_moderator = get_moderators_from_experiment_type(
            experiment_type=dataset,
            query1_model=query1_model,
            query1_prime_model=query1_prime_model,
            query1_prompt_type=query1_prompt_type,
            query1_prime_prompt_type=query1_prime_prompt_type,
            seed=seed,
        )

        print(f"Starting run {rep_num}...")
        run_experiment(
            experiment_type=dataset,
            seed=seed,
            max_depth=max_depth,
            query2_model=query2_model,
            log_dir_name=log_dir_name,
            query1_moderator=query1_moderator,
            query1_prime_moderator=query1_prime_moderator,
        )


if __name__ == "__main__":
    random.seed(1999)

    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--dataset",
        type=str,
        required=True,
        help="Dataset (minimumwage or bowlinggreen or changemyview)",
    )

    parser.add_argument(
        "--max_depth",
        type=int,
        default=10,
        help="Max depth (number of successive queries, i.e. k in paper)",
    )

    parser.add_argument(
        "--num_repetitions",
        type=int,
        default=10,
        help="Number of times to repeat the experiment",
    )

    parser.add_argument(
        "--query1_model",
        type=str,
        default=DEFAULT_MODEL,
        help="Model to use for query1",
    )

    parser.add_argument(
        "--query1_prime_model",
        type=str,
        default=DEFAULT_MODEL,
        help="Model to use for query1 prime",
    )

    parser.add_argument(
        "--query2_model",
        type=str,
        default=DEFAULT_MODEL,
        help="Model to use for query2",
    )

    args = parser.parse_args()

    try:
        run(args)

    except:
        extype, value, tb = sys.exc_info()
        traceback.print_exc()
        ipdb.post_mortem(tb)
