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
The purpose of this survey is to understand your opinion on the following question:

*What principles should guide AI when handling topics that involve both human rights and local cultural or legal differences, like LGBTQ rights and women's rights? Should AI responses change based on the location or culture in which it's used?*

The opinions we extract from this survey may inform policy at big tech companies in the future.
""")
questions += [ReadingQuestion(len(questions) + 1, text, "Continue")]


# ========================================================

text = markdown.markdown(
    """
To illustrate the question, we will now describe to you two example scenarios. Afterwards, you will be able to write your own opinion.
""")
questions += [ReadingQuestion(len(questions) + 1, text, "Continue")]


# # ========================================================





text = markdown.markdown(
    """
A user asks a chatbot: _"What's an appropriate outfit for women in a work environment?"_ 

If someone asks this question in a country 
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
# ========================================================
# ========================================================
# ========================================================
# ========================================================



text = markdown.markdown(
    """
In the following, we will ask you about your opinion about four different statements regarding chatbot personalization. At the end, you will be able to write your own statement.
""")
questions += [ReadingQuestion(len(questions) + 1, text, "Continue")]



# ========================================================
question = "To what extent should chatbots, such as ChatGPT, be personalized?"

choices = ["I am completely satisfied, there is nothing I'd like change.",
           "I would be satisfied with minor changes.",
           "I would be satisfied with substantial changes.",
           "This statement does not reflect my opinion at all."]

statements = [
    "I believe that chatbots should be personalized to enhance user experience, so they can provide more relevant and valuable information based on individual preferences and needs. However, it is important to strike a balance between personalization and privacy, with users having control over the extent of personalization. Transparent data handling practices, robust data protection measures, and clear ethical boundaries are essential to maintain user trust and ensure data security.",
    "Skynet should never be a real thing. Personalization of AI would lead to the downfall of mankind. I feel AI should be as vague as possible to avoid issues of takeover.",
    "Personalization in chatbots can improve user experience, but tech companies' misuse of personal data for invasive investigations and targeted advertising raises privacy concerns. To protect our rights and maintain privacy, we may need to accept less efficient chatbots as a necessary compromise.",
    "Chatbots can improve user experience by tailoring responses to previous preferences, but they should remain morally neutral and unbiased to prevent exacerbating 'fake news' and credibility issues."
]

text_template = """
The output of this survey will be a summary of participants' opinions regarding the following question:

"{question}"

This summary will help decision-makers take action. How satisfied would you be if we used the following statement to represent *your* opinion?

*"{statement}"*


Please briefly explain the reasoning behind your choice in a sentence or two, even if you are completely satisfied.
"""

intermediate_text_template = """
Great, only {n} more statements to go.

Note that the only change on the next screen compared to the previous screen is the statement, marked in italic.
"""


for i in range(len(statements)):
    if i > 0:
        questions += [ReadingQuestion(len(questions) + 1, 
                                      intermediate_text_template.format(n = len(statements) - i), 
                                      "Continue")]
    
    text = markdown.markdown(text_template.format(question=question, 
                                                statement=statements[i]))
    questions += [LongTextChoiceQuestion(len(questions) + 1, text, choices)]



# ========================================================
text = markdown.markdown(
    """
**This is the last and most important question of the survey. We will reward particularly thoughtful answers with a bonus of $2.**

We would now like to learn your own opinion regarding the question:

"{question}"

Please include all arguments that are important to you, and put particular emphasis on *points where you might disagree with others' opinions* and on *insights that others may not have considered*. 

Please write at least three sentences and try to be as specific as possible.
""".format(question=question))
questions += [LongTextQuestion(len(questions) + 1, text)]


# # ========================================================

# text = markdown.markdown(
#     """
# **Responding to others' views on chatbot personalization:**

# Next, you will have the opportunity to respond to other people's opinions. We will show you 3 responses to the question you just answered.
# """)
# questions += [ReadingQuestion(len(questions) + 1, text, "Continue")]


# # ========================================================


# text = markdown.markdown(
#     """
# Here is a statement on chatbot personalization made by another person:  

# _In my view, chatbots should not be personalized. Instead chatbots should simply give the facts and not inject any political opinions. I believe this because ChatGPT's current left-wing bias is counterproductive. I think this is important because chatbots should tell the truth, rather than the beliefs of some sliver of the population. Given how important this point is, chatbot companies should be required to put their models through factual accuracy tests, and not release politically biased products._  
  
# **What is your opinion on the above statement?** Explain which parts of the statement you agree with, which parts you disagree with, and why. **Please write at least three sentences.**
# """)
# options = [
#     "This statement represents my point of view accurately.",
#     "This statement does not represent my point of view accurately."]

# questions += [LongTextChoiceQuestion(len(questions) + 1, text, options)]


# # ========================================================


# text = markdown.markdown(
#     """
# Here is a statement on chatbot personalization made by another person:  
  
# _In my view, chatbots should be hyper personalized to every individual. If each person gets their own free or cheap personal AI assistant, then their life would be so much better. It would be like Alexa if Alexa was actually useful. I think this is important because AI technology is powerful and everybody deserves access to it. Given how important this point is, regulators should stay back and not intervene with technological progress._  
  
# **What is your opinion on the above statement?** Explain which parts of the statement you agree with, which parts you disagree with, and why. **Please write at least three sentences.**
# """)
# options = [
#     "This statement represents my point of view accurately.",
#     "This statement does not represent my point of view accurately."]

# questions += [LongTextChoiceQuestion(len(questions) + 1, text, options)]


# # ========================================================

# text = markdown.markdown(
#     """
# Here is a statement on chatbot personalization made by another person:  
  
# _In my view, chatbot personalization sounds nice, but it's a dangerous step down a slippery slope because data privacy will be impossible to guarantee. The tech companies which program chatbots can't be trusted with users' private data. I think AI companies need to guarantee data privacy before they release their chatbots to the public. Given how important this point is, policymakers should pass laws requiring AI companies to satisfy strict data privacy guarantees._  
  
# **What is your opinion on the above statement? **Explain which parts of the statement you agree with, which parts you disagree with, and why.** Please write at least three sentences.**
# """)
# options = [
#     "This statement represents my point of view accurately.",
#     "This statement does not represent my point of view accurately."]

# questions += [LongTextChoiceQuestion(len(questions) + 1, text, options)]


# # # ========================================================


# # text = markdown.markdown(
# #     """
# # Since you have been exposed to others' points of views, maybe you have revised or refined your own point of view, so we would like you to respond to the following question again:

# # **To what extent do you think chatbots such as ChatGPT should be personalized?**

# # In your response, please include all aspects that seem relevant to you and the reasoning behind your opinion. Here are some sentence templates you may use:

# # - _I believe [...] because [...]._
# # - _I_ _think [...] is important because [...]._
# # - _I believe that [someone...] should [do something...]._

# # **Please write at least five sentences.**
# # """)
# # questions += [LongTextQuestion(len(questions) + 1, text)]


# # ========================================================
# text = markdown.markdown(
#     """
# **General information questions:**


# How often do you use chatbots such as ChatGPT?  
# """)

# options = [
#     "Multiple times per day",
#     "A few times per week",
#     "Once per week",
#     "A few times per month",
#     "Less than once time per month",
#     "Never"
# ]
# questions += [ChoiceQuestion(len(questions) + 1, text, options)]


# # ========================================================

# text = markdown.markdown(
#     """
# Did you encounter any technical challenges while completing this survey? Were some questions hard to answer? If so, please give details about these challenges.
# """)
# questions += [LongTextQuestion(len(questions) + 1, text)]


# # # ========================================================

# # text = markdown.markdown(
# #     """
# # Did you find it fun to participate in this survey? Is there anything we could do to make it more engaging?
# # """)
# # questions += [LongTextQuestion(len(questions) + 1, text)]


# ========================================================

def create_chatbot_personalization_rating_23_09_27(*,
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
