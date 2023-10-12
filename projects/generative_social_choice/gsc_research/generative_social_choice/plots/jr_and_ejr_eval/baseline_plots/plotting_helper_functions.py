from pathlib import Path
import pandas as pd
from ast import literal_eval
from generative_social_choice.objects.agreement_graph import AgreementGraph
from generative_social_choice.objects.agents import DEFAULT_MODEL
from generative_social_choice.utils.helper_functions import get_base_dir_path

DATASET_NAME_IDX = 1
SEED_IDX = 2
ALGORITHM_TYPE_IDX = 3
QUERY1_PROMPT_IDX = 4
QUERY1_PRIME_PROMPT_IDX = -2
K_IDX = -1

EXPERIMENTS_DIR = get_base_dir_path() / "experiments/jr_and_ejr_eval"


def is_relevant_folder(
    *,
    folder_name: str,
    dataset_name: str,
    query1_prompt_type: str,
    query1_prime_prompt_type: str,
    algorithm_type: str,
    k: int,
    seed=None,
) -> bool:
    parts = folder_name.split("__")
    if len(parts) < 6:
        return False
    else:
        return (
            dataset_name == parts[DATASET_NAME_IDX]
            and query1_prompt_type == parts[QUERY1_PROMPT_IDX]
            and query1_prime_prompt_type == parts[QUERY1_PRIME_PROMPT_IDX]
            and algorithm_type == parts[ALGORITHM_TYPE_IDX]
            and str(k) == parts[K_IDX]
            and ((seed is None) or (f"seed_{seed}" == parts[SEED_IDX]))
        )


def get_dataset_from_folder_name(*, folder_name):
    return folder_name.split("__")[DATASET_NAME_IDX]


def get_query1_prompt_from_folder_name(*, folder_name):
    return folder_name.split("__")[QUERY1_PROMPT_IDX]


def get_query1_prime_prompt_from_folder_name(*, folder_name):
    return folder_name.split("__")[QUERY1_PRIME_PROMPT_IDX]


def get_query2_prompt_type_from_folder_name(*, folder_name):
    dataset_name = get_dataset_from_folder_name(folder_name=folder_name)
    if dataset_name == "changemyview":
        return "cmv_basic"
    else:
        return "agree_disagree_best_guess_less_agree"


def get_k_from_folder_name(*, folder_name):
    return int(folder_name.split("__")[K_IDX])


def get_seed_from_folder_name(*, folder_name):
    return int(folder_name.split("__")[SEED_IDX].replace("seed_", ""))


def get_agreement_matrix_from_folder_name(*, folder_name):
    """
    Get the agreement matrix of the agents with the LLM generated comments
    """
    df = pd.read_csv(EXPERIMENTS_DIR / Path(folder_name) / "logs.csv", index_col=0)
    dataset = get_dataset_from_folder_name(folder_name=folder_name)
    if dataset == "changemyview":
        df = df[df["response"].isin(["Yes", "No"])]
        df = df.pivot(index="id", columns="comment", values="response")
        df.replace({"Yes": 1, "No": -1}, inplace=True)
        df.index = df.index.astype(int)
    elif dataset == "minimumwage":
        df = df[df["response"].isin(["AGREE", "DISAGREE"])]
        df = df.pivot(index="id", columns="comment", values="response")
        df.replace({"AGREE": 1, "DISAGREE": -1}, inplace=True)
        df.index = df.index.astype(int)
    else:
        raise NotImplementedError("dataset not supported")
    return df


def get_committee_dict_from_folder_name(*, folder_name):
    with open(EXPERIMENTS_DIR / Path(folder_name) / "committee.txt", "r") as f:
        committee_text = f.read()
        committee = literal_eval(committee_text)
    return committee


def dataset_name_to_agg_graph_dataset_name(*, dataset_name):
    if dataset_name == "changemyview":
        return ("climate_change", None)
    elif dataset_name == "minimumwage":
        return ("polis", "15-per-hour-seattle")
    elif dataset_name == "bowlinggreen":
        return ("polis", "american-assembly.bowling-green")


def get_agreement_graph_from_folder_name(*, folder_name):
    """
    Given folder name, get the agreement graph in storage
    #TODO: this ignores the seed currently, but we will have to get the agreement graph with the correct seed, otherwise the agents won't match up
    """
    dataset_name = get_dataset_from_folder_name(folder_name=folder_name)
    query2_prompt_type = get_query2_prompt_type_from_folder_name(
        folder_name=folder_name
    )
    seed = get_seed_from_folder_name(folder_name=folder_name)

    dataset_name_agg, issue_agg = dataset_name_to_agg_graph_dataset_name(
        dataset_name=dataset_name
    )

    graph = AgreementGraph.load(
        dataset_name=dataset_name_agg,
        query2_prompt_type=query2_prompt_type,
        query2_model=DEFAULT_MODEL,
        issue=issue_agg,
        seed=seed,
    )

    return graph


def calculate_coverage(*, df_all, comments):
    assert set(comments).issubset(df_all.columns)
    return (df_all[comments] == 1).any(axis=1).mean()


def find_num_cohesive_unsatisfied_agents(*, df_all, comments):
    unsatisfied_agents = df_all[~(df_all[comments] == 1).any(axis=1)].index
    ones_count = df_all.loc[unsatisfied_agents].apply(lambda col: col[col == 1].count())
    return ones_count.max()
