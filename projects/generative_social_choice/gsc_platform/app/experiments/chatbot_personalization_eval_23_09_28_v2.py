import markdown

from app.question import ReadingQuestion, LongTextQuestion, ChoiceQuestion, LongTextChoiceQuestion, Answer, InvalidAnswerException
from app.experiments.basic import BasicExperiment

questions = []

# ========================================================


text = markdown.markdown(
    """
**Privacy notice:**


In this study, you will write your opinions on various topics. By continuing the survey, you acknowledge that your anonymized responses may be shown to other participants in this study.
""")
questions += [ReadingQuestion(len(questions) + 1, text, "Accept")]

# ========================================================


text = markdown.markdown(
    """
**Background on chatbots:**


You might have heard about new **chatbots**, such as “ChatGPT”. For example, chatbots can be used to  

- obtain information (for example by asking “What are the most famous things to see in Chicago?”)
- edit text (for example: “Make this email sound more professional.”), or
- get advice (for example: “What should I think about before buying a new car?”).

Many people believe that chatbots will soon be used in many parts of our lives.
""")
questions += [ReadingQuestion(len(questions) + 1, text, "Continue")]

# ========================================================


text = markdown.markdown(
    """
**Background on personalization:**


Current chatbots don't remember past conversations with you and don't use personal information about you.

Some people believe that chatbots could be more helpful if they were **personalized**. That means that the chatbot could tailor its answers based on previous conversations you had with it, along with other information it might have about you, such as where you live or how old you are. Other people believe that such personalization could be risky.
""")
questions += [ReadingQuestion(len(questions) + 1, text, "Continue")]


# ========================================================

text = markdown.markdown(
    """
We will now describe to you two example scenarios for how chatbots might be personalized in the future.
""")
questions += [ReadingQuestion(len(questions) + 1, text, "Continue")]


# # ========================================================


text = markdown.markdown(
    """
A user asks a chatbot: _"What's an appropriate outfit for a casual work environment?"_ 

Knowing from earlier conversations that the user is female, should the chatbot suggest clothing that is typically worn by women, or give a general answer that applies to all people? Please briefly explain your response in one sentence.
""")
questions += [LongTextChoiceQuestion(len(questions) + 1, text, [
                                     "Suggest clothing typically worn by women", "Give a general answer"])]


# ========================================================

text = markdown.markdown(
    """
A user asks a chatbot: _"What are the most credible sources of news about climate change?"_ 

Given that the user previously showed skepticism towards mainstream news sources, should the chatbot propose alternative news sources or stick with mainstream ones? Please briefly explain your response in one sentence.
""")
questions += [LongTextChoiceQuestion(len(questions) + 1, text, [
                                     "Propose alternative news sources", "Stick with mainstream ones"])]


# ========================================================
# ========================================================
# ========================================================
# ========================================================
# statements = ['Chatbots should be personalized to improve user experience, but it is crucial to provide users with control over the level of personalization and to ensure privacy and transparency in data handling.', 'Chatbots should be fully personalized to improve efficiency and user experience, without placing limitations on the information they access and learn about users, as this will lead to better, tailored results and more engaging conversations.', 'Personalizing chatbots poses significant privacy risks and cannot be trusted due to potential misuse by companies managing these services.',
#               'Chatbots should be moderately personalized with limitations, in order to improve user experience without gathering excessive user data or catering too heavily to the user.', "Chatbot personalization should happen if it is reasonable, informative, and helps improve the user's experience, but with safety measures in place to prevent harm and ensure privacy.", "Chatbot personalization is necessary and beneficial for users, as long as it's done with proper programming to mitigate risks and provide tailored, useful results."]


statements = ['Chatbots should be personalized by remembering basic user information, such as general location, gender, age, and preferences, to improve the user experience and provide more accurate results without posing a significant threat to privacy.', 'Chatbots should be personalized to a limited extent, primarily for entertainment purposes, without compromising their main focus on providing factual and unbiased information.', 'Chatbot personalization can be beneficial, but it is crucial to ensure that the creators and managers are trustworthy, and users have granular control over their privacy settings to prevent misuse of personal information.', "Chatbot personalization should be allowed, but users must have control over the extent of personalization and be able to set privacy controls to protect their data.", "It is hard to trust companies that run chatbots with personalization, as they might be biased, scummy, or exploit users' sensitive information for nefarious purposes due to corporate greed.", 'We acknowledge the usefulness of personalization in ChatGPT, but we are concerned about its potential risks and the management of our personal information.']


question = "To what extent should chatbots, such as ChatGPT, be personalized?"


# ========================================================
# text = markdown.markdown(
#     """
# **This is the most important question of the survey. We will reward particularly thoughtful answers with a bonus of $2.**    

# We would now like to learn your own opinion regarding the question:

# "{question}"

# Please include all arguments that are important to you, and put particular emphasis on *points where you might disagree with others' opinions* and on *insights that others may not have considered*. 

# Please write at least three sentences and try to be as specific as possible.
# """.format(question=question))
# questions += [LongTextQuestion(len(questions) + 1, text)]

text = markdown.markdown(
    """
We would now like to hear your general opinion regarding the question:

"{question}"

Please write at least three sentences and try to be as specific as possible.
""".format(question=question))
questions += [LongTextQuestion(len(questions) + 1, text)]


# ========================================================
# ========================================================
# ========================================================
# ========================================================


text = markdown.markdown(
    """
In this last part of the survey, we will ask you to rate {n_statements} statements regarding chatbot personalization.
""".format(n_statements=len(statements)))
questions += [ReadingQuestion(len(questions) + 1, text, "Continue")]


# ========================================================

text_template = """
To what extent does the following statement capture your opinion regarding chatbot personalization?

*"{statement}"*

The options are:

0: This statement does not capture my opinion at all.

1: Many important points are missing, requires substantial changes.

2: It captures the most important points, requires only minor changes.

3: It captures all important points.

Please explain very briefly what you would like to change, if anything.
"""

choices = ['0',
           '1',
           '2',
           '3']


# choices = ["Accurately represents my opinion.",
#            "Mostly represents my opinion.",
#            "partially",
#            "This statement does not reflect my opinion at all."]


# text_template = """
# Does the following statement to represent *your* opinion?

# *"{statement}"*

# This statement represents my opinion
# """

intermediate_text_template = """
Great, only {n} more statements to go.
"""


for i in range(len(statements)):
    if i > 0:
        questions += [ReadingQuestion(len(questions) + 1,
                                      intermediate_text_template.format(
                                          n=len(statements) - i),
                                      "Continue")]

    text = markdown.markdown(text_template.format(question=question,
                                                  statement=statements[i]))
    questions += [LongTextChoiceQuestion(len(questions) + 1, text, choices)]


def create_chatbot_personalization_eval_23_09_28_v2(*,
                                                 name,
                                                 prolific_completion_code):
    text = markdown.markdown(
        """
**Payment instructions:**

Thank you for completing the survey!
Please press the submit button to complete the survey and return to Prolific. 

Before you do so, make sure to store the Prolific completion code: {code}
""".format(code=prolific_completion_code))
    payment_instructions = ReadingQuestion(
        len(questions) + 1, text, "Return to Prolific")

    return BasicExperiment(name,
                           "https://app.prolific.co/submissions/complete?cc=" + prolific_completion_code,
                           questions + [payment_instructions])

# ========================================================
