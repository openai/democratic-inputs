# TODO: This file is only a temporary demonstration, and will be deleted soon.

from app.experiments.experiment import Experiment
from app.question import *

chatbot_text = """\
<p><b>Background on chatbots:</b></p>
<p>You might have heard about new chatbots like "ChatGPT". These chatbots are computer programs that can hold text conversations with a user, in a way that seems close to human-like. For example, chatbots can be used to</p>
<ul>
<li>obtain information (for example by asking "What are the most famous things to see in Chicago?")</li>
<li>edit text (for example: "Make this email sound more professional."), or</li>
<li>get advice (for example: "What should I think about before buying a new car?").</li>
</ul>
<p>It is important to keep in mind that chatbots sometimes give incorrect or biased answers. Still, many people think that chatbots will soon be used in many parts of our lives.</p>
<p>Here, I’m trying to sneak in an image tag: <img src="">, which should get escaped for security reasons.</p>
"""

class QuestionTypeDemoExperiment(Experiment):
    """Abstract interface for an experiment that can be run on the server."""
    def __init__(self, experiment_name: str, completion_url: str):
        self.static_questions = [ReadingQuestion(-1, chatbot_text, "Note this custom button!"),
                                 LongTextQuestion(-1, "What do you think about <b>chatbots?</b>"),
                                 ChoiceQuestion(-1, "From 0 to 7, how satisfied are you with this experiment?", ["0", "1", "2", "3", "4", "<i>5</i>", "6<script>alert('yo');</script>", "7"]),
                                 LongTextChoiceQuestion(-1, "The following statement was made by a fellow participant: "
                                                           "<blockquote>“And here, poor fool! with all my lore. I stand, no wiser than before.”</blockquote>"
                                                           "Do you agree or disagree with this statement? And why?", ["Agree", "Disagree"])]
        self.user_next = {}
        super().__init__(experiment_name, completion_url)

    def next_question(self, user_id: str) -> Optional[Question]:
        step = self.user_next.get(user_id, 0)
        question = self.static_questions[step % len(self.static_questions)]  # make this survey loop forever
        question.step = step
        return question

    def submit_answer(self, user_id: str, answer: Answer, step: int) -> None:
        old_step = self.user_next.get(user_id, 0)
        self.user_next[user_id] = old_step + 1
