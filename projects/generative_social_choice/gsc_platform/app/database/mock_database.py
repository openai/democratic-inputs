from typing import Optional, Tuple, Dict

from app.question import Question, Answer

# Placeholder, replace with Postgres table Questions with following columns:
# experiment_name (str), user_id (str), step (int), question_text(str)
# table index should be (experiment_name, user_id, step).
questions_dict: Dict[Tuple[str, str, int], Question] = {}

# Placeholder, replace with Postgres table Answers with following columns:
# experiment_name (str), user_id (str), step (int), answer_text(str)
# table index should be (experiment_name, user_id, step).
# should have foreign key constraint that (experiment_name, user_id, step) should be an existing key in Questions table.
answers_dict: Dict[Tuple[str, str, int], Answer] = {}


def get_question(experiment_name: str, user_id: str, step: int) -> Optional[Question]:
    """For the given index, return the text to the corresponding question if it exists, else None."""
    if (experiment_name, user_id, step) in questions_dict:
        return questions_dict[(experiment_name, user_id, step)]
    else:
        return None


def get_answer(experiment_name: str, user_id: str, step: int) -> Optional[Answer]:
    """For the given index, return the text to the corresponding answer if it exists, else None."""
    assert (experiment_name, user_id, step) in questions_dict
    if (experiment_name, user_id, step) in answers_dict:
        return answers_dict[(experiment_name, user_id, step)]
    else:
        return None


def save_question(experiment_name: str, user_id: str, question: Question) -> None:
    step = question.step
    if (experiment_name, user_id, step) in questions_dict:
        raise ValueError("Question already exists. Overwriting should be done with caution and is not currently "
                         "intended through this interface.")
    questions_dict[(experiment_name, user_id, step)] = question
    print("QUESTIONS:", questions_dict)


def save_answer(experiment_name: str, user_id: str, step: int, answer: Answer) -> None:
    if (experiment_name, user_id, step) in answers_dict:
        raise ValueError("Answer already exists. Overwriting should be done with caution and is not currently "
                         "intended through this interface.")
    answers_dict[(experiment_name, user_id, step)] = answer
    print("ANSWERS:", answers_dict)


def get_latest_answer(experiment_name: str, user_id: str) -> Optional[Tuple[int, Answer]]:
    """For a given experiment and user, return the latest answer in the sequence registered in the database so far.
    Specifically, among all answers in the database with step number `step` and answer text `answer`, choose
    the one with maximum `step`, and then return the tuple `(step, answer)`. If no answer exists, return None.
    """
    applicable_indices = [(exp, uid, step) for exp, uid, step in answers_dict.keys()
                          if exp == experiment_name and uid == user_id]
    if len(applicable_indices) == 0:
        return None
    else:
        max_step = max(step for _, _, step in applicable_indices)
        return max_step, answers_dict[(experiment_name, user_id, max_step)]
