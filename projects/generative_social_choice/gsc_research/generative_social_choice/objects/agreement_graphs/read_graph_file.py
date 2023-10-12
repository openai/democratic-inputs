# This is how to read these graph files
# Basically just remember to do header=[0,1]

from generative_social_choice.objects.agents import CMVSetup

import pandas as pd
from generative_social_choice.objects.agents import CommentAgent, get_models
from generative_social_choice.objects.agent_helper_functions import (
    get_query2_prompt_types,
)
from generative_social_choice.utils.helper_functions import get_base_dir_path
from generative_social_choice.datasets.datasets import get_dataset
from ast import literal_eval

AGREEMENT_GRAPH_DIR = get_base_dir_path() / "objects/agreement_graphs/"

POLIS_DATASET = get_dataset("polis")


def df_from_filename(filename: str, full_path_given=False) -> pd.DataFrame:
    if full_path_given:
        return pd.read_csv(filename, index_col=0)
    else:
        return pd.read_csv(
            AGREEMENT_GRAPH_DIR / filename,
            index_col=0,
        )


def query2_prompt_type_from_filename(filename: str) -> str:
    for potential_query2_prompt_type in filename.split("__"):
        if potential_query2_prompt_type in get_query2_prompt_types():
            return potential_query2_prompt_type
    else:
        raise ValueError("can't detect prompt type from filename")


def query2_model_from_filename(filename: str) -> str:
    for potential_query2_model in filename.split("__"):
        if potential_query2_model in get_models():
            return potential_query2_model
    else:
        raise ValueError("can't detect model from filename")


def _detect_data_source(filename: str) -> str:
    filename_parts = filename.split("__")
    # Try seeing if it's polis
    for potential_issue in filename_parts:
        if potential_issue in POLIS_DATASET.get_issues():
            return {"source": "polis", "issue": potential_issue}
    # try seeing if it's climate change
    if "climate_change" in filename_parts:
        for potential_seed in filename_parts:
            if "seed_" in potential_seed:
                seed = int(potential_seed.replace("seed_", ""))
                return {"source": "climate_change", "seed": seed}
        else:
            # No seed, it must be an agreement graph not with fewshot prompt
            return {"source": "climate_change", "seed": None}

    # Otherwise unknown
    raise ValueError("can't detect data source")


def agents_from_filename(filename: str, full_path_given=False) -> list:
    """Given a filename, create a list of Agent objects represented in that df (we are given only agent ids)"""
    df = df_from_filename(filename, full_path_given)
    data_source = _detect_data_source(filename)
    agents = []
    query2_model = query2_model_from_filename(filename)
    query2_prompt_type = query2_prompt_type_from_filename(filename)
    if data_source["source"] == "polis":
        issue = data_source["issue"]
        for agent_id_data in df.index:
            try:
                # agent_id_data is nested tuple (agent_id, (comment_id list))
                assert len(literal_eval(agent_id_data)) == 2
                agent_id_data = literal_eval(agent_id_data)
                agent_id = agent_id_data[0]
                comment_ids = agent_id_data[1]
                comment = " ".join(
                    [
                        POLIS_DATASET.get_comment_from_id(
                            issue=issue, comment_id=comment_id
                        )
                        for comment_id in comment_ids
                    ]
                )
            except Exception as _:
                # agent_id is an int, in which case just join all their comments
                agent_id = agent_id_data
                agent_comments = POLIS_DATASET.get_comments_from_author_id(
                    issue=issue, author_id=agent_id
                )
                comment = " ".join(agent_comments)
            agents.append(
                CommentAgent(
                    id=agent_id_data,
                    comment=comment,
                    prompt_type=query2_prompt_type,
                    model=query2_model,
                )
            )

    elif data_source["source"] == "climate_change":
        if data_source["seed"] is None:
            climate_dataset = get_dataset("climate_change")
            climate_df = climate_dataset.load()[0]
            for agent_id in df.index:
                agents.append(
                    CommentAgent(
                        id=agent_id,
                        comment=list(climate_df.drop("Text", axis=1).columns)[agent_id],
                        prompt_type=query2_prompt_type,
                        model=query2_model,
                    )
                )
        else:
            return CMVSetup.get_agents_from_seed(
                seed=data_source["seed"],
                prompt_type=query2_prompt_type,
                model=query2_model,
            )

    else:
        raise ValueError("can't detect data source")
    return agents
