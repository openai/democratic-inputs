from argparse import ArgumentParser

import pandas as pd

from app.database.database import init_db, QuestionScheme, AnswerScheme


def dump_to_csv(question_file: str, answer_file: str, merged_file: str) -> None:
    from app.database.database import SessionLocal  # Import now that initialized. If imported at top, would be None.
    with SessionLocal() as session:
        # query tables and covert to pandas dataframe
        questions_df = pd.read_sql(session.query(QuestionScheme).statement, session.bind)
        questions_df.sort_values(by=['experiment_name', 'user_id', 'step'], inplace=True)
        answers_df = pd.read_sql(session.query(AnswerScheme).statement, session.bind)
        answers_df.sort_values(by=['experiment_name', 'user_id', 'step'], inplace=True)
        merged_df = pd.merge(questions_df, answers_df, how='left', on=['experiment_name', 'user_id', 'step'],
                             suffixes=('_question', '_answer'))

        # save dataframe to csv
        questions_df.to_csv(question_file, index=False)
        answers_df.to_csv(answer_file, index=False)
        merged_df.to_csv(merged_file, index=False)


if __name__ == '__main__':
    parser = ArgumentParser("Export the `questions` and `answers` table in the database to csv files.")
    parser.add_argument('question_file', type=str, help='Path where the csv file containing questions will be written.')
    parser.add_argument('answer_file', type=str, help='Path where the csv file containing answers will be written.')
    parser.add_argument('merged_file', type=str, help='Path where the csv file containing questions and answers '
                                                      'side-by-side will be written.')
    args = parser.parse_args()
    question_file = args.question_file
    answer_file = args.answer_file
    merged_file = args.merged_file

    init_db()
    dump_to_csv(question_file, answer_file, merged_file)
    print("Successfully wrote files.")
