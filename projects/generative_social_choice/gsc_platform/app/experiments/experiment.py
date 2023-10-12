from abc import abstractmethod
from typing import Optional

from app.question import Question, Answer


class InvalidRequestException(Exception):
    """Exception raised by `submit_answer()` if the request is invalid."""
    def __init__(self, message):
        self.message = message


class Experiment:
    """Abstract interface for an experiment that can be run on the server."""

    def __init__(self, experiment_name: str, completion_url: str):
        self.name = experiment_name  # the name by which the browser and database refer to the experiment
        self.completion_url = completion_url

    @abstractmethod
    def next_question(self, user_id: str) -> Optional[Question]:
        """Return the first unanswered question for the user, along with its step index, or None if the user has
        completed the experiment."""
        pass

    @abstractmethod
    def submit_answer(self, user_id: str, answer: Answer, step: int) -> None:
        """Submit the user's answer to the question with index `step`.
        Might raise InvalidAnswerException if `answer_text` is not an acceptable answer, or InvalidRequestException
        if the request does not conform to the communication protocol.
        """
        pass
