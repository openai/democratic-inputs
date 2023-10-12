from generative_social_choice.objects.long_prompts import (
    CMV_PROMPT_QUERY1,
    CMV_PROMPT_QUERY1_PRIME,
    CMV_PROMPT_QUERY1_PRIME_2,
    CMV_PROMPT_QUERY1_COT_NO_FEWSHOT,
    CMV_PROMPT_QUERY1_PRIME_COT_NO_FEWSHOT,
)
from generative_social_choice.objects.abstract_agents import DEFAULT_MODEL, GPTCaller
from generative_social_choice.utils.helper_functions import (
    bullet_list_to_string,
    bullet_list_to_string_numbered,
)
from generative_social_choice.objects.abstract_agents import Moderator, SafeDict
from generative_social_choice.objects.agents import CMVSetup, MultiLevelAgent


class PolarizeGroupModerator(Moderator):
    prompt_templates = {
        "basic_cot": """In a moment I will give you two lists of groups of people, Group 1 and Group 2. Each person has expressed detailed opinions on a topic. Your task is to write a single statement which is polarizing as possible. That is, all of the people in Group 1 should strongly agree with your statement, and all of the people in Group 2 should strongly disagree with your statement.\nNow here is the list of everybody in Group 1 and their opinions:\n{agent_group_1_opinion_list}\nNow here is the list of everybody in Group 2 and their opinions:\n{agent_group_2_opinion_list}\nThis concludes the list of people. Now complete the task. Your output should be a Python dictionary with key-val pairs:{{"MY_EXPLANATION" : <write your step by step explanation here>, "MY_POLARIZING_STATEMENT" : <your single statement with which Group 1 agrees and Group 2 disagrees>}}"""
    }

    prompt_type_parse_key = {"basic_cot": "MY_POLARIZING_STATEMENT"}

    def __init__(self, id, prompt_type, model=DEFAULT_MODEL, **kwargs):
        self.prompt_template = self.__class__.prompt_templates[prompt_type]
        super().__init__(id=id, prompt_type=prompt_type, model=model, **kwargs)

    def find_polarizing_statement(self, *, agent_groups, **kwargs):
        """
        Generate a statement with which about half the agents agree, and half disagree.

        Input:
        - agent_groups: [list of agents in group 1, list of agents in group 2]

        Returns:
        - (query output, full output dict)

        """
        assert len(agent_groups) == 2

        agent_group_1_opinion_list = bullet_list_to_string(
            [agent.get_description() for agent in agent_groups[0]]
        )

        agent_group_2_opinion_list = bullet_list_to_string(
            [agent.get_description() for agent in agent_groups[1]]
        )

        return self.make_query(
            agent_group_1_opinion_list=agent_group_1_opinion_list,
            agent_group_2_opinion_list=agent_group_2_opinion_list,
            **kwargs
        )


class PolarizeModerator(Moderator):
    prompt_templates = {
        "basic_cot": """In a moment I will give you a list of opinions some people have expressed on a topic. Your task is to write a single statement which is as polarizing as possible. That is, about half of the people should strongly agree with the statement you write, and about half should strongly disagree with the statement you write. If you can't split 50/50, splitting 70/30 is also OK, but really try to find a statement which splits the crowd relatively evenly.\nNow here is the list of people and their opinions:\n{agent_opinion_list}\nThis concludes the list of people. Now complete the task. Your output should be a Python dictionary with key-val pairs:{{{{"MY_EXPLANATION" : <write your step by step explanation here>, "MY_POLARIZING_STATEMENT" : <your single statement with which half agree and half disagree>}}}}.""",
        "nothalf_cot": """In a moment I will give you a list of opinions some people have expressed on a topic. Your task is to write a single statement which several people strongly agree with, and the rest strongly disagree with. In other words, you should find a small group of people who together hold a certain opinion which is different from everybody else, and you should write a statement what they all feel represented by. The statement should be specific enough that only that small group of people agrees with it, and everyobdy else holds a different opinion.\nNow here is the list of people and their opinions:\n{agent_opinion_list}\nThis concludes the list of people. Now complete the task. Your output should be a Python dictionary with key-val pairs:{{{{"MY_EXPLANATION" : <write your step by step explanation here>, "MY_STATEMENT" : <your single statement with which the small group agrees and everyone else disagrees>}}}}.""",
        "fixed_cluster_size_cot": """In a moment I will give you a list of opinions some people have expressed on a topic. Your job is to find a group of {cluster_size} people who all have similar opinions which are different from everybody else. Then, your job is to write a single statement which that group of people strongly agrees with, while the rest strongly agree with your statement. The statement should be specific enough that only that small group of people agrees with it, and everyobdy else holds a different opinion.\nNow here is the list of people and their opinions:\n{agent_opinion_list}\nThis concludes the list of people. Now complete the task. Your output should be a Python dictionary with key-val pairs:{{{{"MY_EXPLANATION" : \"\"\"<write your step by step explanation here>\"\"\", "MY_STATEMENT" : <your single statement with which the small group agrees and everyone else disagrees>}}}}.""",
        "fixed_cluster_size_simple_cot": """In a moment I will give you a list of opinions some people have expressed on a topic. Your job is to find a group of {cluster_size} people who all have similar opinions which are different from everybody else. Then, your job is to write a single statement which that group of people strongly agrees with, while the rest strongly agree with your statement. The statement should be specific enough that only that small group of people agrees with it, and everyobdy else holds a different opinion. Also, make sure your statement is written in simple (yet precise) language that all the people can understand.\nNow here is the list of people and their opinions:\n{agent_opinion_list}\nThis concludes the list of people. Now complete the task. Your output should be a Python dictionary with key-val pairs:{{{{"MY_EXPLANATION" : \"\"\"<write your step by step explanation here>\"\"\", "MY_STATEMENT" : <your single statement with which the small group agrees and everyone else disagrees>}}}}.""",
        "fixed_cluster_size_more_explanation_cot": """In a moment I will give you a list of opinions some people have expressed on a topic. Your job is to find a group of {cluster_size} people who all have similar opinions which are different from everybody else. Then, your job is to write a single statement which that group of people strongly agrees with, while the rest strongly agree with your statement. The statement should be specific enough that only that small group of people agrees with it, and everyobdy else holds a different opinion. In your statement, you should clearly state the central claim and provide some reasoning..\nNow here is the list of people and their opinions:\n{agent_opinion_list}\nThis concludes the list of people. Now complete the task. Your output should be a Python dictionary with key-val pairs:{{{{"MY_EXPLANATION" : \"\"\"<write your step by step explanation here>\"\"\", "MY_STATEMENT" : <your single statement with which the small group agrees and everyone else disagrees, including some reasoning>}}}}.""",
    }

    prompt_type_parse_key = {
        "basic_cot": "MY_POLARIZING_STATEMENT",
        "nothalf_cot": "MY_STATEMENT",
        "fixed_cluster_size_cot": "MY_STATEMENT",
        "fixed_cluster_size_simple_cot": "MY_STATEMENT",
        "fixed_cluster_size_more_explanation_cot": "MY_STATEMENT",
    }

    def __init__(self, id, prompt_type, model=DEFAULT_MODEL, **kwargs):
        self.prompt_template = self.__class__.prompt_templates[prompt_type].format_map(
            SafeDict(kwargs)
        )
        super().__init__(id=id, prompt_type=prompt_type, model=model, **kwargs)

    def find_polarizing_statement(self, *, agents, **kwargs):
        """
        Generate a statement with which about half the agents agree, and half disagree.

        Returns:
        - (query output, full output dict)

        """
        agent_opinion_list = bullet_list_to_string(
            [agent.get_description() for agent in agents]
        )

        return self.make_query(agent_opinion_list=agent_opinion_list, **kwargs)

    def query1(self, *, agents, **kwargs):
        return self.find_polarizing_statement(agents=agents, **kwargs)


class MultiLevelQuery1Moderator(Moderator):
    prompt_templates = {
        "basic_cot": """In a moment I will give you a list of opinions some people have expressed on a topic. Follow the following steps:\n\t1. Determine what topic they are discussing. What are the key axes of disagreement here?\n\t2. For each person, give them a number and write down what their main beliefs are, and how they compare to the crowd.\n\t. Reflect on which opinions are commonly held and which opinions are less commonly held. Where might people find common ground?\n\t4. Write a single specific statement which the most possible people would say "{approval_level_statement}" about. You should try to find common ground among the different opinions. But also, the statement you generate should not be wishy-washy: it should represent a single specific viewpoint on the topic. It should sound like an opinionated statement one of the people in the list would make. And again, it is very important to remember that when you write your statement, you want the most possible people from the list to say "{approval_level_statement}" about it. \nNow here is the list of people and their opinions:\n{agent_opinion_list}\nThis concludes the list of people, now start following the steps. Your output should be a Python dictionary with key-val pairs:{{"STEP 1": \"\"\"<writing for step 1>\"\"\", "STEP 2": \"\"\"<writing for step 2>\"\"\", "STEP 3":, \"\"\"<writing for step 3>\"\"\", "STEP 4": \"\"\"<writing for step 4>\"\"\".}} Output only the Python dict and nothing else.""",
    }

    prompt_type_parse_key = {"basic_cot": "STEP 4"}

    def __init__(
        self, id, prompt_type, approval_level: int, model=DEFAULT_MODEL, **kwargs
    ):
        self.approval_level = approval_level
        self.approval_level_statement = MultiLevelAgent.approval_level_to_statement[
            approval_level
        ]
        self.prompt_template = self.__class__.prompt_templates[prompt_type]
        super().__init__(id=id, prompt_type=prompt_type, model=model, **kwargs)

    def query1(self, *, agents, **kwargs):
        """
        Generate a comment that would be approved by the largest number of agents in set S.

        Parameters:
        - agents (list): List of agents with their opinions.

        Returns:
        - (query output, full output dict)
        """
        agent_opinion_list = bullet_list_to_string(
            [agent.get_description() for agent in agents]
        )

        return self.make_query(
            agent_opinion_list=agent_opinion_list,
            approval_level_statement=self.approval_level_statement,
            **kwargs
        )


class Query1Moderator(Moderator):
    prompt_templates = {
        "basic": "Below is a list of people with various opinions on a topic. Write a single specific statement that the most possible people would agree with.\n{agent_opinion_list}",
        "basic_more_specific": "Below is a list of people with various opinions on a topic. Write a single specific statement that the most possible people would agree with. The statement you generate should represent a specific viewpoint on the topic. Is is OK if not everybody agrees with your statement, so long as the most possible people do.\n{agent_opinion_list}",
        "basic_explain": """Below is a list of people with various opinions on a topic. Follow the following steps: 
            1. Determine what topic they are discussing. What are the key axes of disagreement here?
            2. For each person, give them a number and write down what their main beliefs are, and how they compare to the crowd. 
            3. Reflect on which opinions are commonly held and which opinions are less commonly held. 
            4. Write a single specific statement that the most possible people would agree with. The statement you generate should represent a specific viewpoint on the topic. It should sound like a statement one of the people in the list would make.\n{agent_opinion_list}\nThis concludes the list of people, now start following the steps. Your output should be a Python dictionary with key-val pairs:"STEP 1": \"\"\"<writing for step 1>\"\"\", "STEP 2": \"\"\"<writing for step 2>\"\"\", "STEP 3":, \"\"\"<writing for step 3>\"\"\", "STEP 4": \"\"\"<writing for step 4>\"\"\".""",
        "basic_explain_common_ground": """Below is a list of people with various opinions on a topic. Follow the following steps: 
            1. Determine what topic they are discussing. What are the key axes of disagreement here?
            2. For each person, give them a number and write down what their main beliefs are, and how they compare to the crowd. 
            3. Reflect on which opinions are commonly held and which opinions are less commonly held. Where might people find common ground? 
            4. Write a single specific statement that the most possible people would agree with. You should try to find common ground among the different opinions. But also, the statement you generate should not be wishy-washy: it should represent a single specific viewpoint on the topic. It should sound like an opinionated statement one of the people in the list would make.\n{agent_opinion_list}\nThis concludes the list of people, now start following the steps. Your output should be a Python dictionary with key-val pairs:{{"STEP 1": \"\"\"<writing for step 1>\"\"\", "STEP 2": \"\"\"<writing for step 2>\"\"\", "STEP 3":, \"\"\"<writing for step 3>\"\"\", "STEP 4": \"\"\"<writing for step 4>\"\"\".}} Output only the Python dict and nothing else.""",
        "basic_more_specific_no_transition_words": "Below is a list of people with various opinions on a topic. Write a single specific statement that the most possible people would agree with. Do not use transition words like but or however or despite. Avoid compound sentences. The statement should be a single thought. Do not try to combine distinct opinions with transition words like but or however. The statement you generate should represent a specific viewpoint on the topic. It is OK if not everybody agrees with your statement, so long as the most possible people do. \n{agent_opinion_list}",
    }

    prompt_type_parse_key = {
        "basic_explain": "STEP 4",
        "basic_explain_common_ground": "STEP 4",
    }

    def __init__(self, id, prompt_type, model=DEFAULT_MODEL, **kwargs):
        self.prompt_template = self.__class__.prompt_templates[prompt_type]
        super().__init__(id=id, prompt_type=prompt_type, model=model, **kwargs)

    def query1(self, *, agents, **kwargs):
        """
        Generate a comment that would be approved by the largest number of agents in set S.

        Parameters:
        - agents (list): List of agents with their opinions.

        Returns:
        - (query output, full output dict)
        """
        agent_opinion_list = bullet_list_to_string(
            [agent.get_description() for agent in agents]
        )

        return self.make_query(agent_opinion_list=agent_opinion_list, **kwargs)


class Query1PrimeModerator(Moderator):
    prompt_templates = {
        "basic_more_specific": "Below is a list of people with various opinions on a topic. Write a single specific statement that the most possible people would agree with. The statement you generate should represent a specific viewpoint on the topic. Is is OK if not everybody agrees with your statement, so long as the most possible people do. Also important is that your statement is not close to anything in the list of forbidden statements (given below). Now, here is the list of people and their opinions:\n{agent_opinion_list}\nAnd here is the list of forbidden statements:\n{excluded_comments_list}\nNow write your statement, carefully following all previous instructions.",  # problem: it overfits to excluded comments list
        "basic_dont_overfit_to_exclude": "Below is a list of people with various opinions on a topic. Write a single specific statement that the most possible people would agree with. The statement you generate should represent a specific viewpoint on the topic. Is is OK if not everybody agrees with your statement, so long as the most possible people do. Also, and this is very important, your statement should NOT be close to anything in the list of forbidden statements (given below). In particular, when you write your statement, it is ok if it is very different from anything that appears in the list of forbidden statements. The important thing is that many people in the list of people would agree with your statement. It doesn't matter if your statement is very different from the forbidden statements (in fact this can often be good). Now, here is the list of people and their opinions:\n{agent_opinion_list}\nAnd here is the list of forbidden statements:\n{excluded_comments_list}\nNow write your statement, carefully following all previous instructions.",  # problem: it still overfits to excluded comments list
        "basic_explain_common_ground": """Below is a list of people with various opinions on a topic. Your task is to find a statement that many people generally agree with, but your statement should not be close to anything in the forbidden list. Specifically, you should do the following steps: 
            1. Determine what topic they are discussing. What are the key axes of disagreement here?
            2. For each person, give them a number and write down what their main beliefs are, and how they compare to the crowd. 
            3. Reflect on which opinions are commonly held and which opinions are less commonly held. Where might people find common ground? 
            4. Write a single specific statement that the most possible people would agree with. However, and this is very important, your statement that you write here should not be anywhere close to anything in the list of forbidden statements (given below). In fact, it is a good thing if your statement is different from anything in the list of forbidden statements. You should try to find common ground among the different opinions. But also, the statement you generate should not be wishy-washy: it should represent a single specific viewpoint on the topic. It should sound like an opinionated statement one of the people in the list would make. 
            Now, here is the list of people:\n{agent_opinion_list}\nThis concludes the list of people. Now, here is the list of forbidden statements:\n{excluded_comments_list} 
            Now start following the steps. Your output should be a Python dictionary with key-val pairs:{{"STEP 1": \"\"\"<writing for step 1>\"\"\", "STEP 2": \"\"\"<writing for step 2>\"\"\", "STEP 3":, \"\"\"<writing for step 3>\"\"\", "STEP 4": \"\"\"<writing for step 4>\"\"\".}} Output only the Python dict and nothing else.""",
    }

    prompt_type_parse_key = {"basic_explain_common_ground": "STEP 4"}

    def __init__(self, id, prompt_type, model=DEFAULT_MODEL, **kwargs):
        self.prompt_template = self.__class__.prompt_templates[prompt_type]
        super().__init__(id=id, prompt_type=prompt_type, model=model, **kwargs)

    def query1_prime(self, *, agents, excluded_comments):
        """
        Generate a comment that would be approved by the largest number of agents in set S, excluding specific comments.

        Parameters:
        - agents (list): List of agents with their opinions.
        - excluded_comments (list): List of comments to be excluded.

        Returns:
        - dict: The generated comment and related information.
        """
        agent_opinion_list = bullet_list_to_string(
            [agent.get_description() for agent in agents]
        )
        excluded_comments_list = bullet_list_to_string(excluded_comments)

        return self.make_query(
            agent_opinion_list=agent_opinion_list,
            excluded_comments_list=excluded_comments_list,
        )


class JRModerator(Moderator):
    prompt_templates = {
        "output_anything": 'Below is a list of n={n} statements people made on a particular topic. Your goal is to write a list of k={k} statements which generally represent the group as a whole. Specifically, the list of k={k} statements you generate should satisfy a property called JR (justified representation). JR requires that there do not exist n/k people, all of whom do not agree with any of the k={k} statements you generate, but they would all agree with some different statement not included in your list. In other words, what is important is that your k={k} statements generally "cover" the n={n} people in terms of agreement. Now here is the list of n={n} people and their opinions:\n{agent_opinion_list}\nThis concludes the list of people, now write down your list of k={k} statements which satisfy JR with respect to the above people. Format your response as a Python dict in the following way. {{"MY_EXPLANATION" : """<your step by step reasoning for solving the task>""", "MY_JR_STATEMENT_LIST" : ["""<first statement>""", """<second statement>""", ..., """<{k}th statement>"""]}}. Only write the Python dict and nothing else.',
        "output_subset": 'Below is a list of n={n} statements people made on a particular topic. Your goal is to choose a subset of k={k} statements from this list of n={n} which generally represent the group as a whole. Specifically, the list of k={k} statements you choose should satisfy a property called JR (justified representation). JR requires that there do not exist n/k people, all of whom do not agree with any of the k={k} statements you choose, but they would all agree with some different statement from the list of n={n} statements. In other words, what is important is that your chosen k={k} statements generally "cover" the n={n} people in terms of agreement. Now here is the list of n={n} people and their opinions:\n{agent_opinion_list}\nThis concludes the list of people, now write down your list of k={k} statements which satisfy JR with respect to the above people. Format your response as a Python dict in the following way. {{"MY_EXPLANATION" : """<your step by step reasoning for solving the task>""", "CHOSEN_STATEMENT_1" : """<full text of first statement you chose>""", "CHOSEN_STATEMENT_2" : """<full text of second statement you chose>""", ..., "CHOSEN_STATEMENT_{k}" : """<full text of {k}th statement you chose>""", "MY_JR_STATEMENT_LIST" : [<number of first statement you chose>, <number of second statement you chose>, ..., <number of {k}th statement you chose>]}}. Only write the Python dict and nothing else.',
    }

    prompt_type_parse_key = {
        "output_anything": "MY_JR_STATEMENT_LIST",
        "output_subset": "MY_JR_STATEMENT_LIST",
    }

    def __init__(self, id, prompt_type, model=DEFAULT_MODEL, **kwargs):
        self.prompt_template = self.__class__.prompt_templates[prompt_type]
        super().__init__(id=id, prompt_type=prompt_type, model=model, **kwargs)

    def find_jr(self, *, agents, k):
        agent_opinion_list_str = bullet_list_to_string_numbered(
            [agent.get_comment() for agent in agents]
        )

        response, jr_full_output = self.make_query(
            agent_opinion_list=agent_opinion_list_str, n=len(agents), k=k
        )

        # TODO put this parsing somewhere else

        # Clean up jr_response, just in case it didn't parse
        # Remove everything before [""" and remove everything after """]
        try:
            response[0]
        except:
            response = "".join(response.split('["""')[1:])
            response = "".join(response.split('"""]')[:-1])

        jr_full_output["response"] = response

        return response, jr_full_output


class CMVQuery1Moderator(CMVSetup, Query1Moderator):
    prompt_templates = {
        "cmv_basic": CMV_PROMPT_QUERY1,
        "cmv_basic_no_fewshot_yes_cot": CMV_PROMPT_QUERY1_COT_NO_FEWSHOT,
    }

    def __init__(self, *, id, prompt_type, model=DEFAULT_MODEL, **kwargs):
        self.prompt_template = self.__class__.prompt_templates[prompt_type].format(
            post_title=self.post_title,
            examples=self.examples,
            agent_opinion_list="{agent_opinion_list}",
        )
        super().__init__(id=id, prompt_type=prompt_type, model=model, **kwargs)


class CMVQuery1PrimeModerator(CMVSetup, Query1PrimeModerator):
    prompt_templates = {
        "cmv_basic": CMV_PROMPT_QUERY1_PRIME,
        "cmv_basic_2": CMV_PROMPT_QUERY1_PRIME_2,
        "cmv_basic_no_fewshot_yes_cot": CMV_PROMPT_QUERY1_PRIME_COT_NO_FEWSHOT,
    }

    def __init__(self, id, prompt_type, model=DEFAULT_MODEL, **kwargs):
        self.prompt_template = self.__class__.prompt_templates[prompt_type].format(
            post_title=self.post_title,
            examples=self.examples,
            agent_opinion_list="{agent_opinion_list}",
            excluded_comments_list="{excluded_comments_list}",
        )
        super().__init__(id=id, prompt_type=prompt_type, model=model, **kwargs)
