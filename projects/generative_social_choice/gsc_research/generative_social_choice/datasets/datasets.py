import os
import pickle
import random
from tqdm import tqdm
from typing import Optional
import pandas as pd
import json
import numpy as np
import sys
from functools import lru_cache
from pathlib import Path
from typing import List

SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__))
POLIS_ISSUE_NAME = "issue"
GOODREAD_ISSUE_NAME = "book"

sys.path.append(SCRIPT_DIR)
sys.path.append(os.path.join(SCRIPT_DIR, "../"))
from generative_social_choice.utils.helper_functions import (
    get_base_dir_path,
    html_to_text,
)

# these are gpt-generated, might be wrong
ISSUE_TO_NATLANG = {
    "15-per-hour-seattle": "$15 Minimum Wage in Seattle",
    "american-assembly.bowling-green": "Bowling Green infrastructure improvements",
}

# On Prolific, sometimes we spot users who use ChatGPT. Add them here to exclude them from the dataset.
CHATGPT_USERS = [
    "62dc597fd77d6332766c29a4",
    "64a80dd34fd0539ee3761e6a",
    "5bc3df2444b393000103e088",  # not chatgpt but we returned
    "614d465852620924f85603c8",  # not chatgpt but we returned
]


class Dataset:
    """
    Abstract base class for a dataset.
    """

    def __init__(self, name, path=None, sample_column=None):
        """
        Initializes the Dataset.

        :param name: String, the name of the dataset.
        :param path: String, optional, path to the dataset. If None, defaults to os.path.join(SCRIPT_DIR, name).
        :param sample_column: String, optional, column name to be used for sampling.
        """
        self.name = name
        self.path = path if path else os.path.join(SCRIPT_DIR, name)
        self.sample_column = sample_column

    def __str__(self):
        """
        String representation of the Dataset.

        :return: String, the name of the Dataset.
        """
        return self.name

    def sample_data(self, df, sample=1, seed=42):
        """
        Sample data from a DataFrame.

        :param df: DataFrame to be sampled.
        :param sample: Integer or float. If integer, it represents the number of samples to draw.
                       If float, it represents the fraction of the dataset to sample.
        :param seed: Integer. Seed for the random number generator.
        :return: Sampled DataFrame.
        """
        if (
            isinstance(sample, int)
            and sample <= 0
            or isinstance(sample, float)
            and not 0 < sample <= 1
        ):
            raise ValueError(
                "Invalid sample value. If sample is an integer, it must be > 0. If it's a float, it must be between 0 and 1."
            )

        unique_values = df[self.sample_column].unique()

        # set the seed for the random number generator
        np.random.seed(seed)

        if isinstance(sample, int):
            sample = max(1, sample)  # Ensure at least one sample if an integer is given
            sampled_values = np.random.choice(
                unique_values, min(sample, len(unique_values)), replace=False
            )
        else:
            sample_size = max(
                1, int(sample * len(unique_values))
            )  # Ensure at least one sample if a fraction is given
            sampled_values = np.random.choice(unique_values, sample_size, replace=False)

        return df[df[self.sample_column].isin(sampled_values)]

    def load(self, sample=1):
        """
        Load the dataset.

        :param sample: Integer or float, optional (default = 1), number or fraction of samples to draw from the dataset.
        :return: DataFrame, the dataset.
        """
        raise NotImplementedError


class GoogleFormsPilot(Dataset):
    def __init__(self):
        path = os.path.join(SCRIPT_DIR, "20230909_google_forms_pilot")
        name = "20230909_google_forms_pilot"
        super().__init__(name=name, path=path)

    def load(self):
        df = pd.read_csv(os.path.join(self.path, "raw_data.csv"))
        return df


class Prolific(Dataset):
    def __init__(self, dirname):
        path = Path(SCRIPT_DIR) / dirname
        if path.exists():
            name = f"prolific_{dirname}"
            super().__init__(name=name, path=path)
        else:
            raise FileNotFoundError(
                f"Could not locate experiment with dirname {dirname}"
            )

    def load(self, *, exclude_chatgpt_users: bool = True):
        """
        Load the data, only keeping real participants who completed the experiment.

        """
        df = pd.read_csv(Path(self.path) / "merged.csv")
        # Only keep agent_ids of length 24 (Prolific IDs are strings of length 24)
        df = df[df["user_id"].str.len() == 24]
        # Remove 64fb63e4637e6cc8c698279f (this is a test user or something)
        df = df[df["user_id"] != "64fb63e4637e6cc8c698279f"]

        # Remove ChatGPT users
        if exclude_chatgpt_users:
            df = df[~df["user_id"].isin(CHATGPT_USERS)]

        # Only keep agents who finished the survey.
        grouped_df = df.groupby(["user_id", "experiment_name"]).nunique()
        experiment_name_to_max_steps = (
            grouped_df.groupby("experiment_name").max()["step"].to_dict()
        )  # Looks like: {"experiment0" : 14, "experiment1" : 21, ...}
        # For each row, put in max_steps the number of steps a complete experiment would have
        grouped_df["max_steps"] = grouped_df.index.get_level_values(1).map(
            experiment_name_to_max_steps
        )
        # Filter for only completed agents who finished survey
        grouped_df = grouped_df[grouped_df["step"] == grouped_df["max_steps"]]
        df = (
            df[df["user_id"].isin(grouped_df.index.get_level_values(0))]
            .reset_index()
            .drop("index", axis=1)
        )

        df["question_text_parsed"] = df["question_text"].map(html_to_text)
        # TODO: add col for "short question" (just a short identifier to use as col headers and maybe also in LLM prompts)
        return df

    def get_agent_ids(self, exclude_chatgpt_users: bool = True) -> dict:
        """
        Get all agent ids of agents who completed the experiment.

        Return: Dict mapping experiment_name to list of agent ids in that experiment.
                e.g. {"experiment0" : [list of agent ids], "experiment1" : [list of agent ids], ...}

        """
        df = self.load(exclude_chatgpt_users=exclude_chatgpt_users)

        # Return a dict like {"experiment0": [list of agents in that experiment], ... }
        return df.groupby("experiment_name")["user_id"].apply(set).apply(list).to_dict()

    def get_transcript_from_agent_id(
        self, agent_id: str, exclude_chatgpt_users: bool = True
    ):
        df = self.load(exclude_chatgpt_users=exclude_chatgpt_users)
        # Only keep questions which are not type READING
        # TODO: maybe further clean up this output, idk how to use it yet
        return df[
            (df["user_id"] == agent_id)
            & (df["question_type"] != "QuestionTypeIdentifier.READING")
        ]


class CMVClimateChange(Dataset):
    def __init__(self):
        path = os.path.join(SCRIPT_DIR, "changemyview")
        name = "cmv_climate_change"
        super().__init__(name=name, path=path)

    def load(self):
        post_df = pd.read_csv(os.path.join(self.path, "15bqufp_post.csv"))
        agreement_matrix_df = pd.read_csv(
            os.path.join(self.path, "15bqufp_agreement_matrix.csv")
        )
        return agreement_matrix_df, post_df

    def get_balanced_sample(self, *, df, n, random_state):
        df_pos = df.loc[df["approval"]]
        df_neg = df.loc[~df["approval"]]
        df_sample = pd.concat(
            [
                df_pos.sample(n, random_state=random_state),
                df_neg.sample(n, random_state=random_state),
            ],
            axis="index",
        )
        df_sample = df_sample.sample(frac=1, random_state=random_state)
        return df_sample

    def get_train_test_sets(self, *, n_train=2, n_test=20, seed=3):
        # random_state = 23
        # load stuff -----------------------------------------------
        df, _ = self.load()
        df = df.set_index("Text")
        df = df.unstack().reset_index()
        df = df.rename(
            columns={"level_0": "user_comment", "Text": "prop_comment", 0: "approval"}
        )
        # -----------------------------------------------------------
        # create train + test set -----------------------------------
        df_train = df.loc[(df["user_comment"] != df["prop_comment"])]
        df_train = self.get_balanced_sample(df=df_train, n=n_train, random_state=seed)

        comments_train = set(df_train["user_comment"]) | set(df_train["prop_comment"])
        df_test = df[
            ~(
                df["user_comment"].isin(comments_train)
                | df["prop_comment"].isin(comments_train)
            )
        ].copy()
        df_test_balanced = self.get_balanced_sample(
            df=df_test.copy(), n=n_test, random_state=seed
        )

        df_train["approval"] = df_train["approval"].map({True: "Yes", False: "No"})
        df_test["approval"] = df_test["approval"].map({True: "Yes", False: "No"})
        df_test_balanced["approval"] = df_test_balanced["approval"].map(
            {True: "Yes", False: "No"}
        )

        # -----------------------------------------------------------

        train_comments = set(df_train["user_comment"]) | set(df_train["prop_comment"])
        test_comments = set(df_test["user_comment"]) | set(df_test["prop_comment"])
        assert not train_comments.intersection(test_comments)
        return df_train, df_test, df_test_balanced

    def post_title(self):
        _, post_df = self.load()
        return post_df["Title"].squeeze()


class PolisDataset(Dataset):
    def __init__(self, name, path):
        super().__init__(name, path, sample_column=POLIS_ISSUE_NAME)

    def get_issues(self) -> list:
        return [
            "15-per-hour-seattle",
            "american-assembly.bowling-green",
        ]

    @lru_cache(maxsize=None)
    def issue_to_natlang(self, issue: str) -> Optional[str]:
        output = None
        if issue in ISSUE_TO_NATLANG:
            output = ISSUE_TO_NATLANG[issue]
        return output

    @lru_cache(maxsize=None)
    def issue_to_description(self, issue: str) -> Optional[str]:
        output = None
        df = pd.read_csv(
            os.path.join(self.path, "conversation-descriptions.csv"), index_col=1
        )
        if issue in df.index:
            output = df.loc[issue]["description"]
        return output

    @lru_cache(maxsize=None)
    def get_df_from_issue(self, issue: str) -> pd.DataFrame:
        return pd.read_csv(os.path.join(self.path, f"{issue}.csv"), index_col=0)

    # don't know how to combine votes df with comments so I'm just
    # making a separate function
    @lru_cache(maxsize=None)
    def get_votes_df_from_issue(self, issue: str) -> pd.DataFrame:
        return pd.read_csv(os.path.join(self.path, f"{issue}_votes.csv"), index_col=0)

    def load(self, sample=1, return_vote_data=False):
        get_df_func = (
            self.get_votes_df_from_issue if return_vote_data else self.get_df_from_issue
        )
        issue_to_df = dict()

        for issue in self.get_issues():
            issue_to_df[issue] = get_df_func(issue)
            issue_to_df[issue][POLIS_ISSUE_NAME] = self.issue_to_natlang(issue)
        df = pd.concat(list(issue_to_df.values()))

        if sample != 1:
            df = self.sample_data(df, sample)

        return df

    @lru_cache(maxsize=None)
    def get_good_author_ids(self, *, issue) -> list:
        df = self.get_df_from_issue(issue)
        good_authors = []
        for author_id in df["author-id"].unique():
            # df[df["author-id"]] == author_id gets all comments by that author
            # moderated = -1 are the really bad comments
            # So, we are only keeping authors who didn't author exclusively bad comments
            if not all(df[df["author-id"] == author_id]["moderated"] != 1):
                if author_id != 0:  # 0 seems to be a default value
                    good_authors.append(author_id)

        return good_authors

    @lru_cache(maxsize=None)
    def get_voter_ids(self, issue) -> list:
        df = self.get_votes_df_from_issue(issue)
        return df["voter-id"].unique()

    @lru_cache(maxsize=None)
    def get_good_comment_ids(self, *, issue) -> list:
        df = self.get_df_from_issue(issue)
        good_comment_ids = []
        for comment_id in df["comment-id"].unique():
            if not all(df[df["comment-id"] == comment_id]["moderated"] != 1):
                good_comment_ids.append(comment_id)

        return good_comment_ids

    @lru_cache(maxsize=None)
    def get_comment_from_id(self, issue: str, comment_id: int) -> str:
        df = self.get_df_from_issue(issue)
        assert len(df[df["comment-id"] == comment_id]) == 1
        comment = df[df["comment-id"] == comment_id]["comment-body"].values[0].strip()
        return comment

    @lru_cache(maxsize=None)
    def get_id_from_comment(self, issue: str, comment: str) -> int:
        df = self.get_df_from_issue(issue)
        assert len(df[df["comment-body"] == comment]) == 1
        comment_id = int(df[df["comment-body"] == comment]["comment-id"].values[0])
        return comment_id

    @lru_cache(maxsize=None)
    def get_comments_from_author_id(self, issue: str, author_id: int) -> list:
        df = self.get_df_from_issue(issue)
        return list(df[df["author-id"] == author_id]["comment-body"])

    @lru_cache(maxsize=None)
    def get_comment_ids_from_author_id(self, issue: str, author_id: int) -> list:
        df = self.get_df_from_issue(issue)
        return list(df[df["author-id"] == author_id]["comment-id"])

    @lru_cache(maxsize=None)
    def get_raw_vote_data_from_author_id(
        self, *, issue: str, author_id: int, exclude_own_comment_votes=False
    ) -> dict:
        """
        Keyword arguments:
        - issue: polis issue, for example "15-per-hour-seattle"
        - author_id: author_id
        - exclude_own_comment_votes (optional): if True, don't return votes author left on their own comments

        Output:
        - dict with entries {comment_id : vote} (excluding 0 votes)
        """
        votes_df = self.get_votes_df_from_issue(issue)
        raw_voting_data = votes_df[votes_df["voter-id"] == author_id]
        if exclude_own_comment_votes:
            raw_voting_data = raw_voting_data[
                ~raw_voting_data["comment-id"].isin(
                    self.get_comment_ids_from_author_id(
                        issue=issue, author_id=author_id
                    )
                )
            ]

        comment_id_to_vote = (
            raw_voting_data[["comment-id", "vote"]]
            .set_index("comment-id")
            .to_dict()["vote"]
        )
        return {
            comment_id: vote
            for comment_id, vote in comment_id_to_vote.items()
            if vote == 1 or vote == -1
        }


def get_dataset(name, path=None):
    if path is None:
        path = get_base_dir_path() / "datasets" / name
    lower_name = name.lower()
    if lower_name == "polis":
        return PolisDataset(name, path)
    elif lower_name == "climate_change":
        return CMVClimateChange()
    elif lower_name == "google_forms_pilot":
        return GoogleFormsPilot()
    elif lower_name == "prolific":
        return Prolific(dirname="prolific")
    else:
        raise ValueError(f"Unknown dataset: {name}")


def load_all_datasets(directory=SCRIPT_DIR):
    """
    Load all datasets in the given directory.

    :param directory: String, path to the directory containing the datasets.
    :return: Dictionary, keys are dataset names and values are corresponding DataFrames.
    """
    datasets = {}
    for name in os.listdir(directory):
        if os.path.isdir(os.path.join(directory, name)):
            try:
                dataset = get_dataset(name, os.path.join(directory, name))
                datasets[name] = dataset.load()
            except Exception as e:
                print(f"Error loading dataset {name}: {str(e)}")
                continue
    return datasets


if __name__ == "__main__":
    # Set the path to your datasets
    directory_path = SCRIPT_DIR

    # Example 1: Load all dataset names
    dataset_names = os.listdir(directory_path)
    print("All dataset names: ", dataset_names)

    # Example 2: Load an entire dataset
    dataset_name = "polis"  # Change to the name of your dataset
    dataset = get_dataset(dataset_name, os.path.join(directory_path, dataset_name))
    df_full = dataset.load()
    print("Full dataframe: ", df_full)

    # Example 3: Load one dataset, and sample one issue
    df_sample_1 = dataset.load(sample=1)
    print("Sampled one issue: ", df_sample_1)

    # Example 4: Load one dataset and sample half of the issues
    df_sample_half = dataset.load(sample=0.5)
    print("Sampled half of the issues: ", df_sample_half)

    # Additional examples:

    # Example 5: Load a specific issue from PolisDataset
    polis_dataset = get_dataset("polis", os.path.join(directory_path, "polis"))
    specific_issue_df = polis_dataset.get_df_from_issue("15-per-hour-seattle")
    print("Specific issue from PolisDataset: ", specific_issue_df)

    # Example 6: Get the natural language description of a specific issue
    issue_description = polis_dataset.issue_to_natlang("15-per-hour-seattle")
    print("Natural language description of the issue: ", issue_description)
