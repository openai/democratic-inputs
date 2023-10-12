import sys
from typing import Optional, Tuple

from psycopg2 import errors
from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKeyConstraint,
    create_engine,
    Text,
    Enum,
    DateTime,
    func,
)
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import relationship, sessionmaker, declarative_base

from app.question import Answer, Question, QuestionTypeIdentifier

Base = declarative_base()


def SessionLocal():  # placeholder, will be overwritten by `init_db`
    raise ValueError("Database used before initialization.")


def init_db():
    DATABASE_URL = NotImplementedError
    engine = create_engine(DATABASE_URL, connect_args={"connect_timeout": 20})
    global SessionLocal
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    # Create any missing tables (doesn’t migrate if table schemas are changed, though).
    Base.metadata.create_all(engine)

    try:
        print("Trying to connect to database… This can take a few seconds.")
        conn = engine.connect()
        print("✅ Database connection successful.")
        conn.close()
    except Exception as e:
        print("❌ Database connection failed. More details below:")
        print(e)
        print(
            "\nFor local testing, you can set the FLASK_MOCK_DB environment variable to 'true' to test without the "
            "database."
        )
        sys.exit(1)


class QuestionScheme(Base):
    __tablename__ = "questions"

    experiment_name = Column(String(255), primary_key=True)
    user_id = Column(String(255), primary_key=True)
    step = Column(Integer, primary_key=True)

    question_type = Column(Enum(QuestionTypeIdentifier), nullable=False)
    question_text = Column(Text, nullable=False)
    button_label = Column(String(255), nullable=True)
    json_choices = Column(Text, nullable=True)
    time_stamp = Column(
        DateTime(timezone=True), server_default=func.now()
    )  # automatically set by server


class AnswerScheme(Base):
    __tablename__ = "answers"

    experiment_name = Column(String(255), primary_key=True)
    user_id = Column(String(255), primary_key=True)
    step = Column(Integer, primary_key=True)

    choice = Column(String(255), nullable=True)
    text = Column(Text, nullable=True)
    time_stamp = Column(
        DateTime(timezone=True), server_default=func.now()
    )  # automatically set by server

    __table_args__ = (
        ForeignKeyConstraint(
            [experiment_name, user_id, step],
            [
                QuestionScheme.experiment_name,
                QuestionScheme.user_id,
                QuestionScheme.step,
            ],
        ),
        {},
    )

    question = relationship("QuestionScheme")


def get_question(experiment_name: str, user_id: str, step: int) -> Optional[Question]:
    with SessionLocal() as session:
        question_scheme = session.get(QuestionScheme, (experiment_name, user_id, step))
    if question_scheme is None:
        return None
    question = Question.from_data_scheme(question_scheme)
    assert question.step == step
    return question


def get_answer(experiment_name: str, user_id: str, step: int) -> Optional[Answer]:
    with SessionLocal() as session:
        answer = session.get(AnswerScheme, (experiment_name, user_id, step))
    return Answer(choice=answer.choice, text=answer.text) if answer else None


def save_question(experiment_name: str, user_id: str, question: Question) -> None:
    step = question.step
    with SessionLocal() as session:
        question_scheme = question.to_data_scheme(experiment_name, user_id, step)
        try:
            session.add(question_scheme)
            session.commit()
        except IntegrityError as e:
            if isinstance(e.orig, errors.UniqueViolation):
                raise ValueError(
                    "Question already exists. Overwriting should be done with caution and is not currently "
                    "intended through this interface."
                )
            else:
                raise ValueError("Some other issue: " + e.orig)


def save_answer(experiment_name: str, user_id: str, step: int, answer: Answer) -> None:
    with SessionLocal() as session:
        answer_scheme = AnswerScheme(
            experiment_name=experiment_name,
            user_id=user_id,
            step=step,
            choice=answer.choice,
            text=answer.text,
        )
        try:
            session.add(answer_scheme)
            session.commit()
        except IntegrityError as e:
            if isinstance(e.orig, errors.UniqueViolation):
                raise ValueError(
                    "Answer already exists. Overwriting should be done with caution and is not currently "
                    "intended through this interface."
                )
            elif isinstance(e.orig, errors.ForeignKeyViolation):
                raise ValueError(
                    "Question does not exist. Answer cannot be saved without a corresponding question."
                )
            else:
                raise ValueError("Some other issue: " + str(e.orig))


def get_latest_answer(
    experiment_name: str, user_id: str
) -> Optional[Tuple[int, Answer]]:
    with SessionLocal() as session:
        latest_answer = (
            session.query(AnswerScheme)
            .filter_by(experiment_name=experiment_name, user_id=user_id)
            .order_by(AnswerScheme.step.desc())
            .first()
        )
        if latest_answer is None:
            return None
        return latest_answer.step, Answer(
            choice=latest_answer.choice, text=latest_answer.text
        )
