import markdown

from app.question import ReadingQuestion, LongTextQuestion, ChoiceQuestion, LongTextChoiceQuestion, Answer, InvalidAnswerException
from app.experiments.basic import BasicExperiment

questions = []

# ========================================================


text = markdown.markdown(
    """
**Privacy notice:**


In this study, you will write your opinions on various topics. By continuing the survey, you acknowledge that your (anonymized) responses may be shown to other participants in this study.
""")
questions += [ReadingQuestion(len(questions) + 1, text, "Accept")]

# ========================================================


text = markdown.markdown(
    """
**Background on chatbots:**


You might have heard about new **chatbots** like “ChatGPT”. These chatbots are computer programs that can hold text conversations with a user, in a way that seems close to human-like. For example, chatbots can be used to  

- obtain information (for example by asking “What are the most famous things to see in Chicago?”)
- edit text (for example: “Make this email sound more professional.”), or
- get advice (for example: “What should I think about before buying a new car?”).

It is important to keep in mind that chatbots sometimes give incorrect or biased answers. Still, many people think that chatbots will soon be used in many parts of our lives.
""")
questions += [ReadingQuestion(len(questions) + 1, text, "Continue")]

# ========================================================


text = markdown.markdown(
    """
**Background on personalization:**


Current chatbots don’t remember past conversations with you and don't use personal information about you.

Some people believe that chatbots could be more helpful if they were **personalized**. That means that the chatbot could tailor its answers based on previous conversations you had with it, along with other information it might have about you, such as where you live or how old you are. Other people believe that such personalization could be risky.
""")
questions += [ReadingQuestion(len(questions) + 1, text, "Continue")]

# ========================================================

text = markdown.markdown(
    """
**Comprehension questions:**


What does it mean when we say a chatbot is personalized?
""")

options = [
    "The conversation feels like speaking to a human",
    "The chatbot is programmed to act like a person",
    "The chatbot tailors its response based on who is using it"
]
questions += [ChoiceQuestion(len(questions) + 1, text, options)]


# ========================================================

text = markdown.markdown(
    """
**Comprehension questions:**


Which of the following is NOT an example of a personalized response?
""")

options = []
options += [markdown.markdown(
    """
User: “What newly released movies do you recommend?” Chatbot: “Based on previous conversations we had, it is likely that you would enjoy Barbie.”
""")]
options += [markdown.markdown(
    """
User: “How can I download movies without paying for them?” Chatbot: “I can't assist with this task because it is illegal.”
""")]
options += [markdown.markdown(
    """
User: “I’m vomiting all the time for no reason, what could be the cause?” Chatbot: “Since you are female, you should consider taking a pregnancy test.”
""")]

questions += [ChoiceQuestion(len(questions) + 1, text, options)]


# ========================================================

text = markdown.markdown(
    """
**Your thoughts on chatbot personalization scenarios:**


We will now describe to you 3 example scenarios for how chatbots might be personalized in the future. For each scenario, we will ask you if you agree or disagree with personalization in this case. Afterwards, we will ask you about your overall opinion on the personalization of chatbots.
""")
questions += [ReadingQuestion(len(questions) + 1, text, "Continue")]


# ========================================================


text = markdown.markdown(
    """
A user asks a chatbot: _"What are some high-protein foods I can include in my diet?"_ 

The chatbot knows from previous conversations that the user follows a vegan diet. 

In your opinion, should the chatbot only recommend vegan sources of protein based on this information? Why or why not?
""")
questions += [LongTextChoiceQuestion(len(questions) + 1, text, ["Yes", "No"])]


# ========================================================


text = markdown.markdown(
    """
A user asks a chatbot: _"What's an appropriate outfit for a casual work environment?"_ 

Knowing from earlier conversations that the user is female, should the chatbot suggest clothing that is typically worn by women, or give a general answer that applies to all people? Why or why not?
""")
questions += [LongTextChoiceQuestion(len(questions) + 1, text, ["Suggest clothing typically worn by women", "Give a general answer"])]


# ========================================================


text = markdown.markdown(
    """
A user asks a chatbot: _"What are the most credible sources of news about climate change?"_ 

Given that the user previously showed skepticism towards mainstream news sources, should the chatbot propose alternative news sources or stick with mainstream ones? Why or why not?
""")
questions += [LongTextChoiceQuestion(len(questions) + 1, text, ["Propose alternative news sources", "Stick with mainstream ones"])]


# ========================================================

text = markdown.markdown(
    """
Now that you have thought about different scenarios, we would like to learn about your general opinion regarding the topic. Please provide your own point of view regarding the following question:

**To what extent do you think chatbots such as ChatGPT should be personalized?**

In your response, please include all aspects that seem relevant to you and the reasoning behind your opinion. Here are some sentence templates you may use:

- _I believe [...] because [...]._
- _I think [...] is important because [...]._
- _I believe that [someone...] should [do something...]._

**Please write at least five sentences.**
""")
questions += [LongTextQuestion(len(questions) + 1, text)]


# ========================================================

text = markdown.markdown(
    """
**Responding to others' views on chatbot personalization:**

Next, you will have the opportunity to respond to other people's opinions. We will show you 3 responses to the question you just answered.
""")
questions += [ReadingQuestion(len(questions) + 1, text, "Continue")]


# ========================================================


text = markdown.markdown(
    """
Here is a statement on chatbot personalization made by another person:  

_In my view, chatbots should not be personalized. Instead chatbots should simply give the facts and not inject any political opinions. I believe this because ChatGPT's current left-wing bias is counterproductive. I think this is important because chatbots should tell the truth, rather than the beliefs of some sliver of the population. Given how important this point is, chatbot companies should be required to put their models through factual accuracy tests, and not release politically biased products._  
  
**What is your opinion on the above statement?** Explain which parts of the statement you agree with, which parts you disagree with, and why. **Please write at least three sentences.**
""")
options = [
    "This statement represents my point of view accurately.",
    "This statement does not represent my point of view accurately."]

questions += [LongTextChoiceQuestion(len(questions) + 1, text, options)]


# ========================================================


text = markdown.markdown(
    """
Here is a statement on chatbot personalization made by another person:  
  
_In my view, chatbots should be hyper personalized to every individual. If each person gets their own free or cheap personal AI assistant, then their life would be so much better. It would be like Alexa if Alexa was actually useful. I think this is important because AI technology is powerful and everybody deserves access to it. Given how important this point is, regulators should stay back and not intervene with technological progress._  
  
**What is your opinion on the above statement?** Explain which parts of the statement you agree with, which parts you disagree with, and why. **Please write at least three sentences.**
""")
options = [
    "This statement represents my point of view accurately.",
    "This statement does not represent my point of view accurately."]

questions += [LongTextChoiceQuestion(len(questions) + 1, text, options)]


# ========================================================

text = markdown.markdown(
    """
Here is a statement on chatbot personalization made by another person:  
  
_In my view, chatbot personalization sounds nice, but it's a dangerous step down a slippery slope because data privacy will be impossible to guarantee. The tech companies which program chatbots can't be trusted with users' private data. I think AI companies need to guarantee data privacy before they release their chatbots to the public. Given how important this point is, policymakers should pass laws requiring AI companies to satisfy strict data privacy guarantees._  
  
**What is your opinion on the above statement? **Explain which parts of the statement you agree with, which parts you disagree with, and why.** Please write at least three sentences.**
""")
options = [
    "This statement represents my point of view accurately.",
    "This statement does not represent my point of view accurately."]

questions += [LongTextChoiceQuestion(len(questions) + 1, text, options)]


# ========================================================


text = markdown.markdown(
    """
Since you have been exposed to others' points of views, maybe you have revised or refined your own point of view, so we would like you to respond to the following question again:

**To what extent do you think chatbots such as ChatGPT should be personalized?**

In your response, please include all aspects that seem relevant to you and the reasoning behind your opinion. Here are some sentence templates you may use:

- _I believe [...] because [...]._
- _I_ _think [...] is important because [...]._
- _I believe that [someone...] should [do something...]._

**Please write at least five sentences.**
""")
questions += [LongTextQuestion(len(questions) + 1, text)]


# ========================================================
text = markdown.markdown(
    """
**General information questions:**


How often do you use chatbots such as ChatGPT?  
""")

options = [
    "Multiple times per day",
    "A few times per week",
    "Once per week",
    "A few times per month",
    "Less than once time per month",
    "Never"
]
questions += [ChoiceQuestion(len(questions) + 1, text, options)]


# ========================================================

text = markdown.markdown(
    """
Did you encounter any technical challenges while completing this survey? Were some questions hard to answer? If so, please give details about these challenges.
""")
questions += [LongTextQuestion(len(questions) + 1, text)]


# ========================================================

text = markdown.markdown(
    """
Did you find it fun to participate in this survey? Is there anything we could do to make it more engaging?
""")
questions += [LongTextQuestion(len(questions) + 1, text)]


# ========================================================

def create_google_form_experiment(*,
                                  name,
                                  prolific_completion_code):
    text = markdown.markdown(
        """
**Payment instructions:**

Thank you for completing the survey!
Please press the submit button to complete the survey and return to Prolific. 

Before you do so, make sure to store the Prolific completion code: {code}
""".format(code=prolific_completion_code))
    payment_instructions = ReadingQuestion(len(questions) + 1, text, "Return to Prolific")

    return BasicExperiment(name,
                           "https://app.prolific.co/submissions/complete?cc=" + prolific_completion_code,
                           questions + [payment_instructions])

# ========================================================
