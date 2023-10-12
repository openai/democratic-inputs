DATASET_NAME_IDX = 1
QUERY1_PROMPT_IDX = 4
QUERY1_PRIME_PROMPT_IDX = 5
MAX_DEPTH_IDX = 6

import os


def is_relevant_folder(
    *,
    folder_name: str,
    dataset_name: str,
    query1_prompt: str,
    query1_prime_prompt: str,
    max_depth: int,
) -> bool:
    parts = folder_name.split("__")
    if len(parts) < 7:
        return False
    else:
        return (
            dataset_name == parts[DATASET_NAME_IDX]
            and query1_prompt == parts[QUERY1_PROMPT_IDX]
            and query1_prime_prompt == parts[QUERY1_PRIME_PROMPT_IDX]
            and str(max_depth) == parts[MAX_DEPTH_IDX]
        )


def get_dataset_from_folder_name(*, folder_name):
    return folder_name.split("__")[DATASET_NAME_IDX]


def get_query1_prompt_from_folder_name(*, folder_name):
    return folder_name.split("__")[QUERY1_PROMPT_IDX]


def get_query1_prime_prompt_from_folder_name(*, folder_name):
    return folder_name.split("__")[QUERY1_PRIME_PROMPT_IDX]


def get_max_depth_from_folder_name(*, folder_name):
    return folder_name.split("__")[MAX_DEPTH_IDX]
