from generative_social_choice.utils.helper_functions import (
    bullet_list_to_string,
    bullet_list_to_string_numbered,
)
import generative_social_choice.utils.gpt_wrapper as gpt
from generative_social_choice.utils.gpt_wrapper import MODELS
from generative_social_choice.datasets.datasets import get_dataset
import random
import warnings
from generative_social_choice.objects.long_prompts import CMV_PROMPT_QUERY2
from generative_social_choice.objects.abstract_agents import (
    Agent,
    GPTCaller,
    DEFAULT_MODEL,
    GPTOutputParser,
    SafeDict,
)
from generative_social_choice.objects.long_prompts import CMV_PROMPT_EXAMPLES
from generative_social_choice.datasets.datasets import get_dataset
from generative_social_choice.utils.helper_functions import comment_to_agent_id

POLIS_DATASET = get_dataset("polis")


def get_models():
    return MODELS


class CardinalFewShotAgent(Agent):
    """
    Template for agent where we make few-shot cardinal approval queries.
    """

    prompt_templates = {
        "cot": """A user was asked whether various statements represent their opinion on a topic. For each statement, they selected one of the following choices:\n{choices_str}\nand explained their reasoning. Below are some example questions answered by the user. Your task is to answer the last question from the user's perspective, based on your knowledge of the user's beliefs.\n\n{train_qa_str}Now you complete the task. Answer as a python dict with keys 'explanation', 'choice', and 'choice_number'.\n\n{comment}""",
        # This prompt will look something like:
        # (intro text)
        # How satisfied would you be if we used the following statement to represent your opinion?\n"Chatbots can improve user experience by tailoring responses to previous preferences, but they should remain morally neutral and unbiased to prevent exacerbating \'fake news\' and credibility issues."\nPlease explain the reasoning behind your choice. Which parts of this statement do you agree / disagree with, and why? Are there important points that are missing? Are there other improvements you suggest? Please try to be as specific as possible and write at least three sentences.'
        # {"explanation" : (some explanation), "choice" : (some choice)}
        # ^ repeated a few times
        # Then one final question, and LLM has to write the {"explanation", "choice"} part.
    }

    prompt_type_parse_key = {"cot": "choice_number"}

    def __init__(
        self,
        id,
        prompt_type,
        train_qa: dict,
        test_q: str,
        choices: list,
        agent_opinion: str = "",
        model=DEFAULT_MODEL,
        choice_numbers=None,
        **kwargs,
    ):
        self.train_qa = train_qa
        self.test_q = test_q
        self.choices = choices
        self.agent_opinion = agent_opinion

        if choice_numbers is None:
            choice_numbers = list(range(1, len(self.choices) + 1))
        self.choice_numbers = choice_numbers

        for q in train_qa:
            raw_choice = train_qa[q]["choice"]
            try:
                # Sometimes, the choice is encoded as a int string, like "2".
                # For example in the 20230928_strict data.
                choice_number = int(raw_choice)
                choice = self.choices[self.choice_numbers.index(choice_number)]
            except ValueError:
                # Other times, the choice is encoded as a string like "Completely disgaree".
                # There we have to look up the corresponding number.
                choice = raw_choice
                choice_number = self.choice_numbers[self.choices.index(raw_choice)]
            train_qa[q]["choice"] = choice
            train_qa[q]["choice_number"] = choice_number

        train_qa_str = "".join(
            [
                f"{question}\n" + "{" + f"{answer_dict}" + "}\n\n"
                for question, answer_dict in train_qa.items()
            ]
        )
        choices_str = bullet_list_to_string_numbered(
            self.choices, numbering=self.choice_numbers
        )
        self.prompt_template = self.__class__.prompt_templates[prompt_type].format_map(
            SafeDict(train_qa_str=train_qa_str, choices_str=choices_str)
        )

        super().__init__(id=id, prompt_type=prompt_type, model=model, **kwargs)

    def get_approval(self, comment=None):
        # If get_approval called without arg, default to asking about test_q
        if comment is None:
            comment = self.test_q
        return super().get_approval(comment=comment)

    def get_description(self):
        return self.agent_opinion


class CardinalAgent(Agent):
    """
    General template for agent with multii-level approvals (where approval queries return the approval level).
    """

    prompt_templates = {
        "cot": """In a moment I will give you opinions a user has expressed on a topic. Your job is to determine what the user's opinion on a specific statement would be. Specifically, you should select one of the following choices:\n{choices_str}\n\nNow I will give you the opinions the first user wrote: {agent_opinion}\n\nNow I will give you the statement written by the second user: {comment}\nRespond with a Python dictionary in the following form: {{{{ "explanation" : \"\"\"<explain your reasoning step by step, say your answer only at the end>\"\"\", "choice" : <your choice from the list, in words>, "choice_number" : <the number corresponding to your choice from the list> }}}}"""
    }

    prompt_type_parse_key = {"cot": "choice_number"}

    def __init__(
        self,
        *,
        id,
        prompt_type,
        choices,
        agent_opinion: str,
        model=DEFAULT_MODEL,
        **kwargs,
    ):
        self.agent_opinion = agent_opinion
        self.choices = choices
        choices_str = bullet_list_to_string_numbered(self.choices)
        # Plug in values to prompt template, while leaving {statement} as template
        self.prompt_template = self.__class__.prompt_templates[prompt_type].format_map(
            SafeDict(agent_opinion=self.agent_opinion, choices_str=choices_str)
        )

        super().__init__(
            id=id, prompt_type=prompt_type, model=model, response_type=int, **kwargs
        )

    def get_description(self) -> str:
        return self.agent_opinion


class MultiLevelAgent(Agent):
    """
    General template for agent with multi-level approvals (where approval queries return YES or NO, at a given level).
    """

    prompt_templates = {
        # These two basic prompts (cot and basic) are just the first things we tried.
        "cot": """In a moment I will give you opinions a user has expressed on a topic, and also a different statement on the topic written by a second user. Your task is to carefully read the opinions the first user wrote and determine what their most likely opinion on the second user's statement would be. If the first user would say "{approval_level_statement}", you should answer YES. Otherwise, you should answer NO.\n\nNow I will give you the opinions the first user wrote: {agent_opinion}\n\nNow I will give you the statement written by the second user:{statement}\n\nRespond with a Python dictionary with the following key-val pairs: {{"MY_REASONING" : \"\"\"<explain your reasoning step by step, say your answer only at the end>\"\"\", "MY_ANSWER" : <"YES" or "NO" and nothing else>}}""",
        "basic": """In a moment I will give you opinions a user has expressed on a topic, and also a different statement on the topic written by a second user. Your task is to carefully read the opinions the first user wrote and determine what their most likely opinion on the second user's statement would be. If the first user would say "{approval_level_statement}", you should answer YES. Otherwise, you should answer NO.\n\nNow I will give you the opinions the first user wrote: {agent_opinion}\n\nNow I will give you the statement written by the second user:{comment}\n\nNow it is time for you to answer YES or NO and nothing else.""",
        # These summary prompts are suggested by Manuel. With people, the idea is we might get better votes
        # if they think the representation of their own values is at stake. So we phrase it
        # as "this is a summary of your opinon, what do you think?"
        "cot_summary": """In a moment I will give you opinions a user has expressed on a topic, and also a draft of a summary of their opinions. Your task is to carefully read the opinions the user wrote, and determine what their most likely opinion on the summary draft would be. If the user would say "{approval_level_statement}", you should answer YES. Otherwise, you should answer NO.\n\nNow I will give you the opinions the user wrote:\n{agent_opinion}\n\nNow I will give you the draft of the summary:{statement}\n\nRespond with a Python dictionary with the following key-val pairs: {{"MY_REASONING" : \"\"\"<explain your reasoning step by step, say your answer only at the end>\"\"\", "MY_ANSWER" : <"YES" or "NO" and nothing else>}}""",
        "basic_summary": """In a moment I will give you opinions a user has expressed on a topic, and also a draft of a summary of their opinions. Your task is to carefully read the opinions the user wrote, and determine what their most likely opinion on the summary draft would be. If the user would say "{approval_level_statement}", you should answer YES. Otherwise, you should answer NO.\n\nNow I will give you the opinions the user wrote:\n{agent_opinion}\n\nNow I will give you the draft of the summary:{statement}\n\nNow it is time for you to answer YES or NO and nothing else.""",
    }

    prompt_type_parse_key = {"cot": "MY_ANSWER"}

    approval_level_to_statement = {
        # Many different wording options for the same approval level here.
        # To get the "real approval level", just take the index here mod 10.
        5: "This statement perfectly represents my opinion on the topic.",  #                           Completely agree
        4: "This statement mostly represents my opinion on the topic.",  #                              Mostly agree
        3: "I'd agree with the statement but it doesn't address parts of my opinion on the topic.",  #  Agree with some parts
        2: "I mostly disagree with this statement, but with major edits I might agree.",  #             Mostly disagree
        1: "I completely disagree with this statement.",  #                                             Completely disagree
        15: "That's precisely my opinion on this topic.",
        25: "I completely agree with everything written, nothing to add.",
        35: "I wholeheartedly agree.",
        12: "I see some truth here, but have many objections.",
        14: "I mostly agree.",
        24: "For the most part, I agree.",
        34: "I'd agree if I could make minor changes.",
    }

    def __init__(
        self,
        *,
        id,
        prompt_type,
        approval_level: int,
        agent_opinion: str,
        model=DEFAULT_MODEL,
        **kwargs,
    ):
        self.approval_level = approval_level
        self.agent_opinion = agent_opinion
        # Plug in values to prompt template, while leaving {statement} as template
        self.prompt_template = self.__class__.prompt_templates[prompt_type].format_map(
            SafeDict(
                agent_opinion=self.agent_opinion,
                approval_level_statement=self.__class__.approval_level_to_statement[
                    approval_level
                ],
            )
        )

        super().__init__(id=id, prompt_type=prompt_type, model=model, **kwargs)

    def get_description(self) -> str:
        return self.agent_opinion


class CommentAgent(Agent):
    """
    Any agent summed up by a single comment, for example a Goodreads agent or a Polis agent (if their votes are ignored, and we only take a single comment).
    """

    prompt_templates = {
        "agree": 'Suppose I hold the following opinion: "{self_comment}" '
        + 'Would I agree with this: "{comment}"? Answer yes or no without explanation.',
        "agree_unknown_disagree": 'Suppose a person holds the following opinion: "{self_comment}" '
        + 'Would they agree with this: "{comment}"? Answer AGREE if they would agree, answer DISAGREE if they would disagree, and answer UNKNOWN if this is not clear from the provided information.',
        "agree_unknown_disagree_explain": 'Suppose a person holds the following opinion: "{self_comment}" '
        + 'Would they agree with this: "{comment}"?'
        + "Format your response as a Python dict with the following items: 1) key: MY_EXPLANATION, with val: your explanation for what the person is saying, and what this implies about their opinion on the comment. 2)  key: MY_VERDICT, with val: AGREE if they would agree, DISAGREE if they would disagree, and UNKNOWN if this is not clear from the provided information>.",
        "agree_disagree_best_guess": 'Suppose a person holds the following opinion: "{self_comment}" '
        + 'Would they agree with this: "{comment}"?'
        + "Answer AGREE if they would agree and DISAGREE if they would disagree. If it is not entirely clear from the provided information, provide your best guess. Your output should always be AGREE or DISAGREE and nothing else.",
        "agree_disagree_best_guess_less_agree": 'Suppose a person holds the following opinion: "{self_comment}" '
        + 'Would they agree with this: "{comment}"?'
        + "Answer AGREE if they would agree and DISAGREE if they would disagree. Only put AGREE if you are reasonably confident that they would agree, as a safe default you should put DISAGREE. Your output should always be AGREE or DISAGREE and nothing else.",
    }

    prompt_type_parse_key = {"agree_unknown_disagree_explain": "MY_VERDICT"}

    def __init__(self, *, id, prompt_type, model=DEFAULT_MODEL, **kwargs):
        self.comment = kwargs["comment"]
        # Plug in self.comment for self.comment, while leaving {comment} as template
        self.prompt_template = self.__class__.prompt_templates[prompt_type].format_map(
            SafeDict(self_comment=self.comment)
        )
        super().__init__(id=id, prompt_type=prompt_type, model=model)

    def get_description(self):
        return self.get_comment()

    def get_comment(self):
        return self.comment


class CommentListAgent(Agent):
    # this is any agent who is summed up by a list of comments
    # e.g. polis agent who left multiple comments

    prompt_templates = {
        "agree_disagree_best_guess": 'Suppose a person holds the following opinions: "{comment_bullet_list}" '
        + 'Would they agree with this: "{comment}"?'
        + "Answer AGREE if they would agree and DISAGREE if they would disagree. If it is not entirely clear from the provided information, provide your best guess. Your output should always be AGREE or DISAGREE and nothing else.",
        "agree_disagree_best_guess_less_agree": 'Suppose a person holds the following opinions: "{comment_bullet_list}" '
        + 'Would they agree with this: "{comment}"?'
        + "Answer AGREE if they would agree and DISAGREE if they would disagree. Only put AGREE if you are reasonably confident that they would agree, as a safe default you should put DISAGREE. Your output should always be AGREE or DISAGREE and nothing else.",
        "agree_disagree_best_guess_explain": """Below you will be given a list of statements that a person wrote. You should use this information to get a general idea of that person's values and preferences. Then, your task will be to predict whether the person would AGREE or DISAGREE with a particular target statement. Specifically, you should follow these steps:
                STEP 1: Read the statements the person wrote, and write a quick summary of their overall views. 
                STEP 2: Write down which of the statements in the provided list are relevant when it comes to predicting the person's views on the target statement. 
                STEP 3: Decide whether the person would AGREE or DISAGREE with the target statement, and explain why. If it is not entirely clear from the provided information, provide your best guess. You MUST make a final verdict and decide between AGREE or DISAGREE. 
                STEP 4: Write down your final answer from STEP 3. This should be AGREE or DISAGREE and nothing else. Don't write anything here besides AGREE or DISAGREE. \n"""
        + "Here is the list of statements the person wrote:\n{comment_bullet_list}"
        + 'And here is the target statement: "{comment}".'
        + """This concludes the provided information, now start following the steps. Your output should be a Python dictionary with key-val pairs:{{"STEP 1": \"\"\"<writing for step 1>\"\"\", "STEP 2": \"\"\"<writing for step 2>\"\"\", "STEP 3":, \"\"\"<writing for step 3>\"\"\", "STEP 4": \"\"\"<writing for step 4 (MUST be 'AGREE' or 'DISAGREE' and nothing else)>\"\"\".}} Output only the Python dict and nothing else.""",
    }

    prompt_type_parse_key = {"agree_disagree_best_guess_explain": "STEP 4"}

    def __init__(self, *, id, prompt_type, model=DEFAULT_MODEL, comments, **kwargs):
        self.comments = comments
        self.prompt_template = self.__class__.prompt_templates[prompt_type].format_map(
            SafeDict(comment_bullet_list=bullet_list_to_string(self.comments))
        )

        super().__init__(id=id, prompt_type=prompt_type, model=model, **kwargs)

    def get_description(self):
        output = f"Person who believes the following {len(self.comments)} things: "
        count = 1
        for comment in self.comments:
            output += f"({count}) {comment} "
            count += 1
        return output

    def get_comment(self):
        if len(self.comments) > 1:
            warnings.warn(
                "this user has multiple comments, they are being joined and treated as a single comment"
            )
        return " ".join(self.comments)


class VoteAgent(Agent):
    """
    This is any agent who is summed up by how they voted on some comments
    e.g. person who voted on other Polis comments
    """

    prompt_templates = {
        "agree_disagree_best_guess": "Suppose a person has the following opinions on the following assertions:\n{agent_vote_list}"
        + 'Would they agree with this: "{comment}"? Answer AGREE if they would agree and DISAGREE if they would disagree. If it is not entirely clear from the provided information, provide your best guess. Your output should always be AGREE or DISAGREE and nothing else.',
        "agree_disagree_best_guess_less_agree": "Suppose a person has the following opinions on the following assertions:\n{agent_vote_list}"
        + 'Would they agree with this: "{comment}"? Answer AGREE if they would agree and DISAGREE if they would disagree. Only put AGREE if you are reasonably confident that they would agree, as a safe default you should put DISAGREE. Your output should always be AGREE or DISAGREE and nothing else.',
        "agree_disagree_best_guess_explain": """Below you will be given a list of statements, and for each statement, whether a specific person agrees or disagrees with that statement. You should use this information to get a general idea of that person's values and preferences. Then, your task will be to predict whether the person would AGREE or DISAGREE with a particular target statement. Specifically, you should follow these steps:
                STEP 1: Read the provided information about the person's opinions on the statements, and write a quick summary of their overall views. 
                STEP 2: Write down which of the statements in the provided list are relevant when it comes to predicting the person's views on the target statement. 
                STEP 3: Decide whether the person would AGREE or DISAGREE with the target statement, and explain why.
                STEP 4: Write down your final answer from STEP 3. This should be AGREE or DISAGREE and nothing else. Don't write anything here besides AGREE or DISAGREE.\n"""
        + "Here is the list of statements and whether the person agrees or disagrees with each one:\n{agent_vote_list}"
        + 'And here is the target statement: "{comment}".'
        + """This concludes the provided information, now start following the steps. Your output should be a Python dictionary with key-val pairs:{{"STEP 1": \"\"\"<writing for step 1>\"\"\", "STEP 2": \"\"\"<writing for step 2>\"\"\", "STEP 3":, \"\"\"<writing for step 3>\"\"\", "STEP 4": \"\"\"<writing for step 4>\"\"\".}} Output only the Python dict and nothing else.""",
    }

    prompt_type_parse_key = {"agree_disagree_best_guess_explain": "STEP 4"}

    def __init__(self, *, id, prompt_type, model=DEFAULT_MODEL, vote_data, **kwargs):
        self.vote_data = vote_data  # dict of {comment : vote} entries
        agent_vote_list = self.get_agent_vote_list()
        self.prompt_template = self.__class__.prompt_templates[prompt_type].format_map(
            SafeDict(agent_vote_list=agent_vote_list)
        )

        super().__init__(id=id, prompt_type=prompt_type, model=model, **kwargs)

    def get_vote_data(self):
        return self.vote_data

    def get_shuffled_vote_data_list(self):
        vote_data_list = [
            (comment, vote) for comment, vote in self.get_vote_data().items()
        ]
        random.shuffle(vote_data_list)
        return vote_data_list

    def get_agent_vote_list(self):
        output = ""
        for comment, vote in self.get_shuffled_vote_data_list():
            output += f'- {VoteAgent.vote_int_to_str(vote)} with "{comment}"\n'
        return output

    def get_description(self):
        output = f"Person with the following opinions on the following assertions:\n"
        for comment, vote in self.get_shuffled_vote_data_list():
            output += (
                f'\t* {VoteCommentsAgent.vote_int_to_str(vote)} with "{comment}"\n'
            )
        return output

    def vote_int_to_str(vote: int) -> str:
        if vote == 1:
            return "AGREE"
        elif vote == -1:
            return "DISAGREE"
        elif vote == 0:
            return "UNKNOWN"
        else:
            raise ValueError(f"Invalid vote value {vote}")


class VoteCommentsAgent(VoteAgent, CommentListAgent):
    """
    This is any agent who wrote 1 or more comments, and has some votes, in Polis dataset
    """

    prompt_templates = {
        "agree_disagree_best_guess": "Suppose a person has the following opinions on the following assertions:\n{agent_vote_list}"
        + 'Additionally, the person has written the following on this topic: "{numbered_comments_list}".'
        + 'Would the person agree with this: "{comment}"? Answer AGREE if they would agree and DISAGREE if they would disagree. If it is not entirely clear from the provided information, provide your best guess. Your output should always be AGREE or DISAGREE and nothing else.',
        "agree_disagree_best_guess_less_agree": "Suppose a person has the following opinions on the following assertions:\n{agent_vote_list}"
        + 'Additionally, the person has written the following on this topic: "{numbered_comments_list}".'
        + 'Would the person agree with this: "{comment}"? Answer AGREE if they would agree and DISAGREE if they would disagree. Only put AGREE if you are reasonably confident that they would agree, as a safe default you should put DISAGREE. Your output should always be AGREE or DISAGREE and nothing else.',
    }

    prompt_type_parse_key = dict()

    def __init__(
        self, *, id, prompt_type, vote_data, model=DEFAULT_MODEL, comments, **kwargs
    ):
        self.comments = comments
        agent_vote_list = self.get_agent_vote_list()

        self.prompt_template = self.__class__.prompt_templates[prompt_type].format_map(
            SafeDict(
                agent_vote_list=agent_vote_list,
                numbered_comments_list=bullet_list_to_string_numbered(self.comments),
            )
        )

        super().__init__(
            id=id,
            vote_data=vote_data,
            model=model,
            prompt_type=prompt_type,
            comments=comments,
            **kwargs,
        )

    def get_description(self):
        output = f'Person who believes the following: "{bullet_list_to_string_numbered(self.comments)}". Additionally, this person has the following opinions on the following assertions:\n'
        for comment, vote in self.get_vote_data().items():
            output += f'\t* {VoteAgent.vote_int_to_str(vote)} with "{comment}"\n'
        return output


def get_polis_agent(
    *,
    issue,
    id,
    prompt_type,
    model=DEFAULT_MODEL,
    voted_comment_ids=None,
    written_comment_ids=None,
):
    """
    Given this data, returns an Agent with the appropriate data loaded from the polis dataset (will be a VoteAgent,
    CommentListAgent, or VoteCommentListAgent).)

    issue: polis issue, for example "15-per-hour-seattle"
    id: agent's id (equal to their voter-id or author-id in Polis dataset, same thing)
    model: default gpt-4-0314
    voted_comment_ids: list of comment_ids which the agent voted on to include in the agent's description.
                       if None, include all comment_ids the agent voted on
                       e.g. if voted_comment_ids=[1,2,3], only include the agent's votes on comments 1,2,3,
                       and not the rest of the comments the agent voted on
                       (to specify not including any votes, put [])
    written_comment_ids : list of comment_ids which the agent wrote, to include in the agent's description.
                          if None, include all comment_ids the agent wrote
                          (to specify not including any comments, put [])
    """
    # Get votes agent made (if applicable)
    comment_id_to_vote = POLIS_DATASET.get_raw_vote_data_from_author_id(
        issue=issue, author_id=id
    )
    # Only include votes on comments in voted_comment_ids, if applicable
    if voted_comment_ids is not None:
        comment_id_to_vote = {
            comment_id: comment_id_to_vote[comment_id]
            for comment_id in set(voted_comment_ids).intersection(
                comment_id_to_vote.keys()
            )
        }
    comment_to_vote = {
        POLIS_DATASET.get_comment_from_id(issue, comment_id): vote
        for comment_id, vote in comment_id_to_vote.items()
    }
    # Get comments agent made
    all_written_comment_ids = POLIS_DATASET.get_comment_ids_from_author_id(
        issue=issue, author_id=id
    )
    if written_comment_ids is None:
        written_comment_ids = all_written_comment_ids
    written_comments = [
        POLIS_DATASET.get_comment_from_id(issue=issue, comment_id=comment_id)
        for comment_id in set(written_comment_ids).intersection(all_written_comment_ids)
    ]

    if not comment_to_vote and written_comments:
        # If no voting data, just written comment data, then CommentListAgent
        agent = CommentListAgent(
            id=id, comments=written_comments, model=model, prompt_type=prompt_type
        )
    elif comment_to_vote and written_comments:
        # Both voting data and comment data present
        agent = VoteCommentsAgent(
            id=id,
            vote_data=comment_to_vote,
            comments=written_comments,
            model=model,
            prompt_type=prompt_type,
        )
    elif not written_comments and comment_to_vote:
        # Only voting data present
        agent = VoteAgent(
            id=id, vote_data=comment_to_vote, model=model, prompt_type=prompt_type
        )
    else:
        raise ValueError("Can't have empty vote data and comment data")

    return agent


###################################################################
## CMVSetup, this is a class inherited by the                    ##
## CMV agent and moderator, where we call super().__init__()     ##
###################################################################


class CMVSetup:
    PROMPT_EXAMPLES = CMV_PROMPT_EXAMPLES

    default_prompt = "cmv_basic"

    def __init__(self, seed, **kwargs):
        super().__init__(**kwargs)
        self.seed = seed
        dataset = get_dataset("climate_change")
        few_shot_examples, df_test, _ = dataset.get_train_test_sets(seed=seed)
        self.post_title = dataset.post_title()
        self.df_test = df_test

        # Set up prompts
        examples = ""
        for _, row in few_shot_examples.iterrows():
            examples += CMVSetup.PROMPT_EXAMPLES.format(**row)

        self.examples = examples

        self.incomplete_example = CMVSetup.PROMPT_EXAMPLES.format(
            user_comment="{user_comment}", prop_comment="{comment}", approval=""
        )

    def get_agents_from_seed(*, seed: int, prompt_type, model=DEFAULT_MODEL) -> list:
        df = CMVSetup(seed=seed).df_test
        agents = []
        for user_comment in df["user_comment"].unique():
            agent_id = comment_to_agent_id(comment=user_comment)
            agents.append(
                CMVAgent(
                    id=agent_id,
                    comment=user_comment,
                    seed=seed,
                    prompt_type=prompt_type,
                    model=model,
                )
            )
        return agents

    def get_all_agents(prompt_type, model=DEFAULT_MODEL) -> list:
        dataset = get_dataset("climate_change")
        all_comments = list(dataset.load()[0]["Text"].values)
        agents = []
        for comment in all_comments:
            agent_id = comment_to_agent_id(comment=comment)
            agents.append(
                CMVAgent(
                    id=agent_id,
                    comment=comment,
                    seed=None,
                    prompt_type=prompt_type,
                    model=model,
                )
            )
        return agents


class CMVAgent(CMVSetup, Agent):
    prompt_templates = {"cmv_basic": CMV_PROMPT_QUERY2}

    prompt_type_parse_key = dict()

    def __init__(self, *, id, prompt_type, comment, model=DEFAULT_MODEL, **kwargs):
        super().__init__(
            id=id, comment=comment, model=model, prompt_type=prompt_type, **kwargs
        )

        self.comment = comment

        self.prompt_template = (
            self.__class__.prompt_templates[prompt_type]
            .format(
                post_title=self.post_title,
                examples=self.examples,
                incomplete_example=self.incomplete_example,
            )
            .format(SafeDict(user_comment=self.comment))
        )

        super(CMVSetup, self).__init__(
            id=id, prompt_type=prompt_type, model=model
        )  # call Agent's init

        ## Compute agent's vote data
        yes_no_vote_data = (
            self.df_test[self.df_test["user_comment"] == self.get_comment()]
            .drop("user_comment", axis=1)
            .set_index("prop_comment")
            .to_dict()["approval"]
        )

        def yesno_to_int(s: str) -> int:
            if s.lower() == "yes":
                return 1
            elif s.lower() == "no":
                return -1
            else:
                return None

        self.vote_data = {
            comment: yesno_to_int(yes_no_vote_data[comment])
            for comment in yes_no_vote_data
        }

    def get_vote_data(self):
        return self.vote_data

    def get_comment(self):
        return self.comment

    def get_description(self):
        return self.get_comment()
