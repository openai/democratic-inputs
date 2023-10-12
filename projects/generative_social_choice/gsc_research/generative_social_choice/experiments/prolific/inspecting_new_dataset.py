# %%
from generative_social_choice.datasets.datasets import get_dataset
from generative_social_choice.utils.helper_functions import *



experiment_name = "chatbot_personalization_delta_23_09_24"
question_idx = 7

# load data and keep only relevant stuff ----------------------------
# load
dataset = get_dataset("prolific")
df_orig = dataset.load()
df = df_orig.copy()
df = df.loc[df["question_type"] != "QuestionTypeIdentifier.READING"]

# take relevant data
statements = df.loc[df["step"] == 7, ['question_text_parsed', 'text']]
df = df[(df["experiment_name"] == experiment_name) & (df["step"] == 7)]
df = df.set_index('user_id')



# %%
# print statements --------------------------------

wprint(statements['question_text_parsed'].iloc[0])


dfprint(statements[['text']], max_rows=None, max_col_width=100)

statements[['text']].to_csv("statements_" + experiment_name + ".csv")
# %%
