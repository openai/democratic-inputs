import json
from abc import abstractmethod
from dataclasses import dataclass
from enum import Enum
from typing import Optional, List

from bleach import clean

# could add back <a> tags for links
ALLOWED_TAGS = frozenset({'abbr', 'acronym', 'b', 'blockquote', 'br', 'code', 'em', 'i', 'li', 'ol', 'p', 'strong',
                          'ul'})
ALLOWED_ATTRIBUTES = {'abbr': ['title'], 'acronym': ['title']}


@dataclass
class Answer:
    """`choice` refers to a multiple-choice option the user might have picked, and `answer_text` to free-form
    input they might have written. Any subset of them can be null, depending on the question type.
    """
    choice: Optional[str]
    text: Optional[str]


class InvalidAnswerException(Exception):
    """Exception raised by `submit_answer()` if the answer given by the user is judged invalid."""
    def __init__(self, message):
        self.message = message


class QuestionTypeIdentifier(Enum):
    """String identifying different types of questions in database and JSON data sent to Client."""
    READING = "reading"
    LONGTEXT = "longtext"
    CHOICE = "choice"
    LONGTEXT_CHOICE = "longtext choice"


class Question:
    """Abstract interface for a question that can be asked to the user.

    Questions can use basic HTML for formatting, but are sanitized so that user or GPT generated strings cannot embed
    malicious code. For permissible HTML tags, see `ALLOWED_TAGS`.
    """
    def __init__(self, step: int, question_text: str):
        self.step = step
        self.question_text = clean(question_text, ALLOWED_TAGS, ALLOWED_ATTRIBUTES)

    @abstractmethod
    def transmission_form(self):
        """Return the data structure that will be translated to JSON and then sent to the client."""
        pass

    @abstractmethod
    def validate_answer(self, answer: Answer) -> None:
        """Checks if the answer matches the question type.
        Nothing is returned but, should the answer not fit, an `InvalidAnswerException` will be raised.
        """
        pass

    @abstractmethod
    def to_data_scheme(self, experiment_name: str, user_id: str, step: int) -> 'app.database.database.QuestionScheme':
        """Represent the question in the format needed for storing in the `questions` table."""
        pass

    @classmethod
    def from_data_scheme(cls, question_scheme: 'app.database.database.QuestionScheme') -> 'Question':
        """Construct a Question object from the data scheme."""
        if question_scheme.question_type == QuestionTypeIdentifier.READING:
            return ReadingQuestion(question_scheme.step, question_scheme.question_text, question_scheme.button_label)
        elif question_scheme.question_type == QuestionTypeIdentifier.LONGTEXT:
            return LongTextQuestion(question_scheme.step, question_scheme.question_text)
        elif question_scheme.question_type == QuestionTypeIdentifier.CHOICE:
            return ChoiceQuestion(question_scheme.step, question_scheme.question_text,
                                  json.loads(question_scheme.json_choices))
        elif question_scheme.question_type == QuestionTypeIdentifier.LONGTEXT_CHOICE:
            return LongTextChoiceQuestion(question_scheme.step, question_scheme.question_text,
                                          json.loads(question_scheme.json_choices))
        else:
            raise ValueError("Unknown question type: " + question_scheme.question_type)


import app.database.database  # imported here to avoid circular imports


class ReadingQuestion(Question):
    """A question that is simply a text to be read by the user.
    To move on, the user clicks a button whose label can be customized.
    """

    def __init__(self, step: int, question_text: str, button_label: Optional[str] = None):
        if button_label is None:
            self.button_label = None
        else:
            self.button_label = clean(button_label, tags={}, attributes={}, strip=True)
        super().__init__(step, question_text)

    def transmission_form(self):
        representation = [QuestionTypeIdentifier.READING.value, self.step, self.question_text]
        if self.button_label is not None:
            representation.append(self.button_label)
        return representation

    def validate_answer(self, answer: Answer) -> None:
        if answer.choice is not None:
            raise InvalidAnswerException("Answer to READING question cannot have multiple-choice component.")
        if answer.text is not None:
            raise InvalidAnswerException("Answer to READING question cannot have text component.")

    def to_data_scheme(self, experiment_name: str, user_id: str, step: int) -> 'app.database.database.QuestionScheme':
        return app.database.database.QuestionScheme(
            experiment_name=experiment_name,
            user_id=user_id,
            step=step,
            question_type=QuestionTypeIdentifier.READING,
            question_text=self.question_text,
            button_label=self.button_label
        )


class LongTextQuestion(Question):
    """A question that requires a long-form text answer by the user."""
    def transmission_form(self):
        return [QuestionTypeIdentifier.LONGTEXT.value, self.step, self.question_text]

    def validate_answer(self, answer: Answer) -> None:
        if answer.choice is not None:
            raise InvalidAnswerException("Answer to LONGTEXT question cannot have multiple-choice component.")
        if answer.text is None:
            raise InvalidAnswerException("Answer to LONGTEXT question must have text component.")
        if len(answer.text.strip()) == 0:
            raise InvalidAnswerException("Text component of LONGTEXT answer cannot be empty or whitespace.")

    def to_data_scheme(self, experiment_name: str, user_id: str, step: int) -> 'app.database.database.QuestionScheme':
        return app.database.database.QuestionScheme(
            experiment_name=experiment_name,
            user_id=user_id,
            step=step,
            question_type=QuestionTypeIdentifier.LONGTEXT,
            question_text=self.question_text
        )


class ChoiceQuestion(Question):
    """A multiple-choice question."""

    def __init__(self, step: int, question_text: str, choices: List[str]):
        self.choices = [clean(choice, ALLOWED_TAGS, ALLOWED_ATTRIBUTES) for choice in choices]
        super().__init__(step, question_text)

    def transmission_form(self):
        return [QuestionTypeIdentifier.CHOICE.value, self.step, self.question_text] + self.choices

    def validate_answer(self, answer: Answer) -> None:
        if answer.choice is None:
            raise InvalidAnswerException("Answer to CHOICE question must have multiple-choice component.")
        if answer.text is not None:
            raise InvalidAnswerException("Answer to CHOICE question cannot have text component.")
        if answer.choice not in self.choices:
            raise InvalidAnswerException(f"Multiple-choice component {repr(answer.choice)} of CHOICE answer not among "
                                         f"options: {repr(self.choices)}.")

    def to_data_scheme(self, experiment_name: str, user_id: str, step: int) -> 'app.database.database.QuestionScheme':
        return app.database.database.QuestionScheme(
            experiment_name=experiment_name,
            user_id=user_id,
            step=step,
            question_type=QuestionTypeIdentifier.CHOICE,
            question_text=self.question_text,
            json_choices=json.dumps(self.choices)
        )


class LongTextChoiceQuestion(Question):
    """A question in which the user must both choose one option and return a long-form text answer."""

    def __init__(self, step: int, question_text: str, choices: List[str]):
        self.choices = [clean(choice, ALLOWED_TAGS, ALLOWED_ATTRIBUTES) for choice in choices]
        super().__init__(step, question_text)

    def transmission_form(self):
        return [QuestionTypeIdentifier.LONGTEXT_CHOICE.value, self.step, self.question_text] + self.choices

    def validate_answer(self, answer: Answer) -> None:
        if answer.choice is None:
            raise InvalidAnswerException("Answer to LONGTEXT_CHOICE question must have multiple-choice component.")
        if answer.text is None:
            raise InvalidAnswerException("Answer to LONGTEXT_CHOICE question must have text component.")
        if len(answer.text.strip()) == 0:
            raise InvalidAnswerException("Text component of LONGTEXT_CHOICE answer cannot be empty or whitespace.")
        if answer.choice not in self.choices:
            raise InvalidAnswerException(f"Multiple-choice component {repr(answer.choice)} of LONGTEXT_CHOICE answer "
                                         f"not among options: {repr(self.choices)}.")

    def to_data_scheme(self, experiment_name: str, user_id: str, step: int) -> 'app.database.database.QuestionScheme':
        return app.database.database.QuestionScheme(
            experiment_name=experiment_name,
            user_id=user_id,
            step=step,
            question_type=QuestionTypeIdentifier.LONGTEXT_CHOICE,
            question_text=self.question_text,
            json_choices=json.dumps(self.choices)
        )
