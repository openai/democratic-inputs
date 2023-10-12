from typing import List, Optional, Tuple

from flask import current_app

from app.experiments.experiment import Experiment, InvalidRequestException
from app.question import Answer, Question, InvalidAnswerException

if not current_app.config.get('MOCK_DB', False):
    from app.database.database import init_db, get_question, get_answer, save_question, save_answer, get_latest_answer
    init_db()
else:
    yellow = "\x1b[33;1m"
    reset = "\x1b[0m"
    print(yellow, "Mocking database. No data will be saved. Do NOT use in production, just for local testing.", reset)
    from app.database.mock_database import get_question, get_answer, save_question, save_answer, get_latest_answer


class BasicExperiment(Experiment):
    """A basic experiment that simply goes through a static list of questions."""

    def __init__(self, experiment_name: str, completion_url: str, static_questions: List[Question]):
        for i, question in enumerate(static_questions):
            assert question.step == i + 1
        self.static_questions = static_questions
        super().__init__(experiment_name, completion_url)

    def next_question(self, user_id: str) -> Optional[Question]:
        answer_response = get_latest_answer(self.name, user_id)
        if answer_response is None:
            step = 0
        else:
            step, _ = answer_response
        assert 0 <= step <= len(self.static_questions)

        if step == len(self.static_questions):  # user is done with the experiment
            return None

        new_step = step + 1
        question = get_question(self.name, user_id, new_step)
        if question is not None:
            # question is already in the database
            return question
        else:
            # generate the question and place it in the database
            question = self.static_questions[step]
            assert question.step == new_step
            save_question(self.name, user_id, question)
            return question

    def submit_answer(self, user_id: str, answer: Answer, step: int) -> None:
        matching_question = get_question(self.name, user_id, step)
        if matching_question is None:
            raise InvalidRequestException(f"Question {step} for user {user_id} in experiment {self.name} not yet "
                                          f"generated in the database.")
        if get_answer(self.name, user_id, step) is not None:
            raise InvalidRequestException(f"User {user_id} already gave an answer for question {step} in experiment "
                                          f"{self.name}.")

        # check that answers are submitted in order
        latest_answer_response = get_latest_answer(self.name, user_id)
        if latest_answer_response is None:
            latest_step = 0
        else:
            latest_step, _ = latest_answer_response
        if step != latest_step + 1:
            raise InvalidRequestException(f"User {user_id} so far provided answers up to {latest_step}, so now cannot "
                                          f"provide answer to step {step} in experiment {self.name}.")

        matching_question.validate_answer(answer)
        save_answer(self.name, user_id, step, answer)
