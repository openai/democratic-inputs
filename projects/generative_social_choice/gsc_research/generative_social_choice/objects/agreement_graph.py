import pandas as pd
import numpy as np
from pathlib import Path
from generative_social_choice.utils.helper_functions import (
    get_time_string,
    get_base_dir_path,
)
from generative_social_choice.objects.agreement_graphs.read_graph_file import (
    agents_from_filename,
    query2_prompt_type_from_filename,
    df_from_filename,
    AGREEMENT_GRAPH_DIR,
)
from generative_social_choice.datasets.datasets import get_dataset
import os
from ast import literal_eval
import re
import warnings
import random

MAX_RETRIES = 5


def remove_junk_characters(text: str) -> str:
    """Remove junk characters from text.
    Example:
    "agree" -> "agree"
    "AGREE!" -> "AGREE"
    "{disagree:''''} -> "disagree"
    """
    return re.sub("[^a-zA-Z]+", "", text)


def is_parsable(*, response: str, query2_prompt_type: str) -> bool:
    if "agree_disagree" in query2_prompt_type:
        have_parsable_output = remove_junk_characters(response).lower() in [
            "agree",
            "disagree",
            "unknown",
        ]
    else:
        have_parsable_output = True  # TODO make this work for other prompts
    return have_parsable_output


def _load_from_filename(*, filename: str, full_path_given=False):
    df = df_from_filename(filename, full_path_given)
    query2_prompt_type = query2_prompt_type_from_filename(filename)
    agents = agents_from_filename(filename, full_path_given)
    return AgreementGraph(df=df, agents=agents, query2_prompt_type=query2_prompt_type)


def _load_from_information(
    *, dataset_name, query2_prompt_type, query2_model, issue="", seed=None
):
    if dataset_name == "polis":
        polis_dataset = get_dataset("polis")
        if issue not in polis_dataset.get_issues():
            raise KeyError("Invalid Polis issue specified")
    else:
        issue = dataset_name  # hack to ignore issue if it's not polis

    if dataset_name != "climate_change":
        seed = None  # ignore seed if not changemyview dataset
    else:
        seed_str = f"seed_{seed}"

    for agreement_graph_filename in os.listdir(AgreementGraph.dir):
        parts = agreement_graph_filename.split("__")
        if (
            dataset_name in parts
            and query2_prompt_type in parts
            and query2_model in parts
            and issue in parts
            and ((seed is None) or (seed_str in parts))
            and "IGNORE" not in parts
        ):
            filename = agreement_graph_filename + "/graph.csv"
            agents = agents_from_filename(filename)
            return AgreementGraph.load(filename=filename, agents=agents)
    else:
        raise FileNotFoundError(
            "couldn't find agreement graph with those parameters. You should create one using `create_agreement_graph()` first."
        )


class AgreementGraph:
    dir = AGREEMENT_GRAPH_DIR

    def __init__(self, **kwargs):
        if (
            "agents" in kwargs
            and "comments" in kwargs
            and "query2_prompt_type" in kwargs
        ):
            # Initalize blank graph
            self.agents = kwargs["agents"]
            self.comments = kwargs["comments"]
            self.query2_prompt_type = kwargs["query2_prompt_type"]
            df = pd.DataFrame(
                index=[agent.get_id() for agent in self.agents], columns=self.comments
            )
            self.df = df
        elif "agents" in kwargs and "df" in kwargs and "query2_prompt_type" in kwargs:
            # Load from df and given list of agents
            self.agents = kwargs["agents"]
            self.query2_prompt_type = kwargs["query2_prompt_type"]
            self.df = kwargs["df"]
            # Check if rows of df are exactly agents.id
            assert set(map(lambda x: literal_eval(str(x)), self.df.index)) == set(
                [agent.get_id() for agent in self.agents]
            )
            self.comments = list(self.df.columns)
        else:
            raise ValueError("Invalid arguments to initialize AgreementGraph")

    def __str__(self):
        return str(self.df)

    def __repr__(self):
        return self.__str__()

    def add(self, *, agent, comment, satisfaction):
        self.df.loc[agent.get_id()][comment] = satisfaction

    def clean(self):
        if self.query2_prompt_type in [
            "agree_disagree_best_guess",
            "agree_disagree_best_guess_less_agree",
        ]:
            self.df = self.df.applymap(lambda x: str(x).lower())
            self.df = self.df.applymap(lambda x: remove_junk_characters(x))
            self.df.replace({"agree": 1, "disagree": -1}, inplace=True)
            self.df = self.df.astype(int)
            assert (
                self.df.applymap(lambda x: True if x in [-1, 1] else False).all().all()
            )
        elif self.query2_prompt_type == "cmv_basic":
            self.df = self.df.applymap(lambda x: str(x).lower())
            self.df = self.df.applymap(lambda x: remove_junk_characters(x))
            self.df.replace({"yes": 1, "no": -1}, inplace=True)
            self.df = self.df.astype(int)
            assert (
                self.df.applymap(lambda x: True if x in [-1, 1] else False).all().all()
            )
        else:
            warnings.warn(
                f"Could not clean agreement graph, unimplemented Query2 prompt type {self.query2_prompt_type}"
            )

    def load(**kwargs):
        if "filename" in kwargs:
            if "full_path_given" not in kwargs:
                kwargs["full_path_given"] = False
            return _load_from_filename(
                filename=kwargs["filename"], full_path_given=kwargs["full_path_given"]
            )
        elif (
            "dataset_name" in kwargs
            and "query2_prompt_type" in kwargs
            and "query2_model" in kwargs
        ):
            if "issue" in kwargs:
                issue = kwargs["issue"]
            else:
                issue = ""
            if "seed" in kwargs:
                seed = kwargs["seed"]
            else:
                seed = None
            return _load_from_information(
                dataset_name=kwargs["dataset_name"],
                query2_prompt_type=kwargs["query2_prompt_type"],
                query2_model=kwargs["query2_model"],
                issue=issue,
                seed=seed,
            )

        else:
            raise NameError("Can't load, not enough arguments specified")

    def find_JR_committee(self, *, k: int) -> list:
        assert len(self.comments) >= k
        df = self.df
        if self.query2_prompt_type == "agree_unknown_disagree":
            df = (df == 1).astype(int).copy()  # hack to make 1 cells 1 and 0,-1 cells 0
        committee = []
        uncovered_agents = set(df.index)
        for _ in range(k):
            if len(df.loc[list(uncovered_agents)].drop(committee, axis=1)) == 0:
                # All agents are covered
                break
            else:
                # Find comment not yet in committee with the highest approval among all uncovered agents
                next_comment = (
                    df.loc[list(uncovered_agents)]
                    .drop(committee, axis=1)
                    .sum()
                    .idxmax()
                )
                committee.append(next_comment)
                uncovered_agents.difference_update(df[df[next_comment] == 1].index)
        return committee

    def find_k_random_comments(self, *, k: int) -> list:
        return random.sample(list(self.df.columns), k)

    def find_k_most_popular_comments(self, *, k: int) -> list:
        return (
            self.df.apply(lambda col: col[col == 1].count(), axis=0)
            .nlargest(k)
            .index.tolist()
        )


def create_agreement_graph(
    verbose=True,
    *,
    agents,
    comments,
    query2_prompt_type,
    query2_model,
    dataset_name,
    issue="",
    ignore=False,
    base_graph_dir=AgreementGraph.dir,
):
    """
    agents: list of agents
    comments: list of comments
    query2_prompt_type
    query2_model
    dataset_name: e.g. "polis", "climate_change"
    issue: if polis, put e.g. "15-per-hour-seattle", otherwise leave blank
    ignore: default False. If True, puts IGNORE in graph dirname and skips over when loading. Enable this when making small test graphs
    """
    if dataset_name == "polis":
        if issue not in get_dataset("polis").get_issues():
            raise ValueError("Invalid issue")
        dataset_name = dataset_name + "__" + issue
    graph_dir = (
        Path(base_graph_dir)
        / f"{get_time_string()}__{dataset_name}__{query2_prompt_type}__{query2_model}__{'IGNORE__' if ignore else ''}/"
    )
    os.mkdir(graph_dir)
    logs = []
    graph = AgreementGraph(
        agents=agents, comments=comments, query2_prompt_type=query2_prompt_type
    )
    for agent in agents:
        for comment in comments:
            if verbose:
                print(
                    f"Querying agent {agent} about comment {comment} using {query2_prompt_type}..."
                )

            have_parsable_output = False
            num_tries = 0
            while not have_parsable_output and num_tries < MAX_RETRIES:
                num_tries += 1
                _, output = agent.get_approval(comment=comment)
                satisfaction = output["response"]
                have_parsable_output = is_parsable(
                    response=satisfaction, query2_prompt_type=query2_prompt_type
                )

            logs.append(output)
            graph.add(
                agent=agent,
                comment=comment,
                satisfaction=satisfaction,
            )
            graph.df.to_csv(graph_dir / "graph_raw_outputs.csv")
            pd.DataFrame(logs).to_csv(graph_dir / "logs.csv")

    graph.clean()
    graph.df.to_csv(graph_dir / "graph.csv")

    return graph


def create_symmetric_agreement_graph(
    verbose=True, *, agents, query2_prompt_type, query2_model, dataset_name
):
    """
    Create agreement graph where the agents are CommentAgents and the comments are the comments of the CommentAgents
    """
    comments = [agent.get_comment() for agent in agents]
    return create_agreement_graph(
        verbose=verbose,
        agents=agents,
        comments=comments,
        query2_prompt_type=query2_prompt_type,
        query2_model=query2_model,
        dataset_name=dataset_name,
    )
