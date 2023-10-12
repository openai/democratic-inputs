from abc import abstractmethod, ABC
from ast import literal_eval
from tenacity import retry, stop_after_attempt, retry_if_exception_type
from generative_social_choice.utils.helper_functions import (
    get_time_string,
    bullet_list_to_string,
)
from typing import Tuple
from generative_social_choice.utils.gpt_wrapper import prompt_gpt, DEFAULT_TEMPERATURE
from typing import List
import random
from statistics import median

from typing import List, Tuple, Set, Dict


DEFAULT_MODEL = "gpt-4-0314"

MAX_PARSE_TRIES = 5


class SafeDict(dict):
    def __missing__(self, key):
        return "{" + key + "}"


#######################################################
### GPT caller and parser: primary GPT interface     ##
#######################################################


class GPTOutputParser:
    def __init__(self, *, parser_type, **kwargs):
        """
        This is a class which parses GPT outputs.
        parser_type == "dict":
            This is when GPT is asked to output a dictionary.
            Additional arguments:
                response_key : name of key where actual response is located (as opposed to extra CoT text)

        You can implement other kinds of parsing by adding code for a different parser_type.

        """
        self.parser_type = parser_type
        if self.parser_type == "dict":
            if "response_key" in kwargs:
                self.response_key = kwargs["response_key"]
            else:
                raise KeyError("Must specify response_key for parser_type=dict")
            if "response_type" in kwargs:
                self.response_type = kwargs["response_type"]
            else:
                self.response_type = str  # default response type is str
        elif self.parser_type == "cast_to_type":
            if "response_type" in kwargs:
                self.response_type = kwargs["response_type"]
            else:
                raise KeyError(
                    "Must specify response_type for parser_type=cast_to_type"
                )
        else:
            raise NotImplementedError(f"Parser type {parser_type} not implemented")

    def _parse_dict_response(self, full_response):
        # Try to parse. If parsing error, SyntaxError will be thrown, which is caught by @retry in GPTCaller, and it will regenerate GPT response
        # and try parsing again. If this happens 5 times and still parsing error, then the SyntaxError will finally be thrown,
        # and then it will pass and return the output with full_response, but no parsed response
        try:
            response_dict = literal_eval(full_response)
            response = response_dict[self.response_key]
            response = self.response_type(response)  # convert to response_type
            # note: if converting type fails and raises an exception, it'll get caught in GPTCaller and be converted to SyntaxError, and GPT will retry
        except SyntaxError:
            # Set response to be the text after response_key
            response_dict = dict()
            try:
                response = full_response.split(self.response_key)[1]
                # TODO: get rid of { and " characters here
            except Exception as e:
                response = full_response

        return response, response_dict

    def _parse_cast_to_type_response(self, full_response):
        response = self.response_type(full_response)
        # note: if converting type fails and raises an exception, it'll get caught in GPTCaller and be converted to SyntaxError, and GPT will retry
        return response, dict()

    def parse_response(self, response):
        if self.parser_type == "dict":
            return self._parse_dict_response(response)
        elif self.parser_type == "cast_to_type":
            return self._parse_cast_to_type_response(response)
        else:
            raise NotImplementedError(f"Parser type {self.parser_type} not implemented")


class GPTCaller:
    def __init__(
        self,
        *,
        id,
        prompt_type,
        prompt_template,
        model,
        parser=None,  # if None, doesn't do parsing
        temperature=DEFAULT_TEMPERATURE,
    ):
        self.id = id
        self.prompt_type = prompt_type
        self.prompt_template = prompt_template
        self.model = model
        self.parser = parser
        self.temperature = temperature

    @retry(
        stop=stop_after_attempt(MAX_PARSE_TRIES),
        retry=retry_if_exception_type(SyntaxError),
    )
    def ask_question(self, **kwargs):
        prompt = self.prompt_template.format(**kwargs)

        temperature = (
            kwargs["temperature"] if "temperature" in kwargs else self.temperature
        )

        full_response = prompt_gpt(
            model=self.model, prompt=prompt, temperature=temperature
        )

        if self.parser is None:
            # No parsing needed
            response = full_response
            response_dict = dict()
        else:
            # Parse output using parser
            try:
                response, response_dict = self.parser.parse_response(full_response)
            except Exception as e:
                raise SyntaxError  # parsing errors might be raised as TypeError or ValueErrors (since sometimes we want to convert types), but raise everything as SyntaxError so it gets caught by this function's retry

        output = {
            "id": self.id,
            "prompt_type": self.prompt_type,
            "prompt template": self.prompt_template,
            "model": self.model,
            "temperature": self.temperature,
            **kwargs,
            "prompt": prompt,
            "response": response,
            "full_response": full_response,
            **response_dict,
            "time": get_time_string(),
        }

        return output


#################################################
## Two main text agents used for our process ####
#################################################


class Agent(ABC):
    def __init__(self, *, id, prompt_type, model, **kwargs):
        self.id = id
        self.prompt_type = prompt_type
        self.model = model
        self.response_type = (
            kwargs["response_type"] if "response_type" in kwargs else str
        )
        self.temperature = (
            kwargs["temperature"] if "temperature" in kwargs else DEFAULT_TEMPERATURE
        )

        # Set up parser
        response_key = self.__class__.prompt_type_parse_key.get(prompt_type)
        if response_key:
            self.parser = GPTOutputParser(
                parser_type="dict",
                response_key=response_key,
                response_type=self.response_type,
            )
        else:
            self.parser = None

        # Set up GPTCaller
        self.gpt_caller = GPTCaller(
            id=self.id,
            prompt_type=self.prompt_type,
            prompt_template=self.prompt_template,  # Implemented in subclass
            model=self.model,
            parser=self.parser,
            temperature=self.temperature,
        )

    def get_id(self):
        return self.id

    @abstractmethod
    def get_description(self) -> str:
        pass

    def get_approval(
        self,
        *,
        comment,
        **kwargs,
    ) -> Tuple[str, dict]:
        """
        Given agent, and comment, makes LLM query to determine if the agent approves the comment.

        Return: (actual approval query output (usually agree/disagree), full output dict)
        """
        output = self.gpt_caller.ask_question(
            subject=self.prompt_type,
            comment=comment,
            model=self.model,
            **kwargs,
        )
        output["query_type"] = "approval"
        return output["response"], output


class Moderator(ABC):
    @abstractmethod
    def __init__(self, *, id, prompt_type, model, **kwargs):
        self.id = id
        self.prompt_type = prompt_type
        self.model = model
        self.temperature = (
            kwargs["temperature"] if "temperature" in kwargs else DEFAULT_TEMPERATURE
        )

        # Set up parser
        response_key = self.__class__.prompt_type_parse_key.get(prompt_type)
        if response_key:
            self.parser = GPTOutputParser(parser_type="dict", response_key=response_key)
        else:
            self.parser = None

        # Set up GPTCaller
        self.gpt_caller = GPTCaller(
            id=self.id,
            prompt_type=self.prompt_type,
            prompt_template=self.prompt_template,  # Implemented in subclass
            model=self.model,
            parser=self.parser,
            temperature=self.temperature,
        )

    def make_query(self, **kwargs) -> Tuple[str, dict]:
        """
        Given moderator, and list of agents, make LLM query to do something like Query1 or Query1'

        Return: (query output, full output dict)
        """

        output = self.gpt_caller.ask_question(
            subject=self.prompt_type,
            model=self.model,
            **kwargs,
        )
        return output["response"], output


#################################
## ranking text agent
#########################


class Comparer(ABC):
    def __init__(self, *, id, prompt_type, model, **kwargs):
        self.id = id
        self.prompt_type = prompt_type
        self.model = model
        self.person_label = (
            kwargs["person_label"] if "person_label" in kwargs else "Person"
        )
        self.temperature = (
            kwargs["temperature"] if "temperature" in kwargs else DEFAULT_TEMPERATURE
        )

        # Set up parser
        response_key = self.__class__.prompt_type_parse_key.get(prompt_type)
        if response_key:
            self.parser = GPTOutputParser(
                parser_type="dict", response_key=response_key, response_type=int
            )
        else:
            self.parser = GPTOutputParser(parser_type="cast_to_type", response_type=int)

        # Set up GPTCaller
        self.gpt_caller = GPTCaller(
            id=self.id,
            prompt_type=self.prompt_type,
            prompt_template=self.prompt_template,  # Implemented in subclass
            model=self.model,
            parser=self.parser,
            temperature=self.temperature,
        )

    def get_id(self):
        return self.id

    def get_closest_agent_idx(
        self,
        *,
        center_agent: Agent,
        other_agents: List[Agent],
    ) -> Tuple[str, dict]:
        """
        Given `center_agent`, and a list of other agents `other_agents`, return the index of the agent which is closest.

        Note: we typically use this query in the case len(other_agents) == 2, in which case this query returns 0 or 1,
        0 if the first agent is closer, and 1 if the second agent is closer.

        Return:
        - (idx of closest agent, logs from GPT call)
        """
        output = self.gpt_caller.ask_question(
            subject=self.prompt_type,
            center_agent_description=center_agent.get_description(),
            other_agents_description=bullet_list_to_string(
                [
                    f"{self.person_label} {idx}: {agent.get_description()}"
                    for idx, agent in enumerate(other_agents)
                ]
            ),
            model=self.model,
        )
        output["query_type"] = "compare"
        return output["response"], output

    def find_nearest_neighbors(
        self, *, center_agent: Agent, agents: List[Agent], m: int
    ) -> Tuple[List[Agent], List[dict]]:
        """
        Given `center_agent` and a list of other agents `agents`, find the `m` agents which are closest to `center_agent`.

        Args:
        - center_agent: The agent we're finding neighbors for.
        - agents: List of potential neighboring agents.
        - m: Number of closest agents to find.

        Return:
        - A tuple containing a list of the m closest agents and logs from GPT calls.
        """
        # Initialize
        logs = []
        among_m_closest = set()
        potential_m_closest = set(agents)

        # main loop to select and refine nearest neighbors
        while len(among_m_closest) < m:
            # select a pivot
            pivot, pivot_logs = self._select_pivot(
                center_agent=center_agent, agents=list(potential_m_closest)
            )
            logs.extend(pivot_logs)

            # 2split by pivot
            closer_agents, farther_agents, split_logs = self._split_by_pivot(
                center_agent=center_agent, pivot=pivot, agents=potential_m_closest
            )
            logs.extend(split_logs)

            k = len(closer_agents) + len(among_m_closest)

            # update based on the value of k
            if k < m:
                among_m_closest.update(closer_agents)
                among_m_closest.add(pivot)
                potential_m_closest = farther_agents
            elif k > m:
                potential_m_closest = closer_agents
            elif k == m:
                among_m_closest.update(closer_agents)
                break
            elif k == m - 1:
                among_m_closest.update(closer_agents)
                among_m_closest.add(pivot)
                break

        return list(among_m_closest), logs

    def _select_pivot(
        self, *, center_agent: Agent, agents: List[Agent], num_samples: int = 5
    ) -> Tuple[Agent, List[dict]]:
        pivot = random.choice(agents)
        return pivot, []

    def _split_by_pivot(
        self, *, center_agent: Agent, pivot: Agent, agents: List[Agent]
    ) -> Tuple[Set[Agent], Set[Agent], List[dict]]:
        """
        Split a list of agents into two groups: those closer to the center agent than the pivot, and those farther.

        Args:
        - center_agent: The agent we're finding neighbors for.
        - pivot: The agent used as a reference for splitting.
        - agents: List of agents to be split.

        Return:
        - Two sets of agents (closer and farther) and logs from GPT calls.
        """
        logs = []
        closer_agents = set()
        farther_agents = set()

        for agent in agents:
            if agent == pivot:
                continue
            closer_agent_idx, log_data = self.get_closest_agent_idx(
                center_agent=center_agent, other_agents=[pivot, agent]
            )
            logs.append(log_data)

            if closer_agent_idx == 1:
                closer_agents.add(agent)
            else:
                farther_agents.add(agent)

        return closer_agents, farther_agents, logs
