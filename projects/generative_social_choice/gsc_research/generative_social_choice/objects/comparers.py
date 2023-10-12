from generative_social_choice.objects.abstract_agents import Comparer, Agent

from generative_social_choice.objects.agents import DEFAULT_MODEL
from typing import List, Tuple

# Define the two parts of the prompt
PROMPT_SKELETON = """In a moment I will give you information about a Reference Person, and then additional people, labeled Person x for some number x. Each of the people has expressed their opinions on a topic. Your task is to carefully read the opinions of the people. Then, you need to determine which Person x has closest opinions to the Reference Person.  We state that person A's opinion is closer to person B's than to person C's if person A would assign a higher agreement score to person B's statement or option than to person C's.
"""


RESPONSE_INSTRUCTION = """So, you should respond with 0 if Person 0's views are overall closer to the Reference Person, and respond with 1 if Person 1's views are overall closer to the Reference Person, and so on. You must respond with a person's number nothing else. If it's not clear which person's views are closer to the Reference Person, just make your best guess. 

Write your chosen x, where Person x has the closest opinions to the Reference Person:"""

END_OF_PROMPT = """\n=== AGENTS === \n Now please answer for the following Reference and two other agents. \nCenter Agent: "{center_agent_description}"\n

Other two agents:
{other_agents_description}\n"""

last_reponse = """"\n Finally, after your reponse, please answer your final answer by "\nX" where X is the answer. 
"""

PROMPT_BASIC = PROMPT_SKELETON + RESPONSE_INSTRUCTION


few_shot = """
==== Examples ====
\n == Example 1 == \n
center_agent_description: 
" climate change is real and a serious concern. They think that renewable energy sources like solar and wind power are essential for the future. They are also in favor of public transportation as a means to reduce carbon emissions."
other_agents_description:
"Person 0: Believes that climate change is a myth and doesn't see the need for renewable energy. Thinks public transportation is inefficient.
Person 1: Believes that climate change is a major concern and thinks that we should shift to renewable energy sources. Is neutral about public transportation."
Correct answer: 1

\n == Example 2 ==  \n
center_agent_description: 
"The Reference Person is an advocate for animal rights and believes that animals should not be used for testing. They are also vegetarian and promote cruelty-free products."
other_agents_description:
"Person 0: Strongly believes in animal rights and is against any form of animal testing. They are vegan and always choose cruelty-free products.
Person 1: Thinks animal testing is necessary for some medical advancements but is against cosmetic testing on animals. Eats meat but promotes cruelty-free cosmetics."
Correct answer: 0

\n == Example 3 ==  \n
center_agent_description: 
"The Reference Person enjoys reading fiction novels, particularly mysteries and thrillers. They love attending literary festivals and have a deep appreciation for classic literature."
other_agents_description:
"Person 0: Enjoys reading non-fiction books about history and science. Occasionally reads mystery novels but isn't fond of thrillers. Rarely attends literary events.
Person 1: Loves reading thrillers and suspense novels. Often attends book launch events and has a collection of modern literature."
Correct answer: 1
"""

CoT = """\n
Take a deep breath and think about the task step by step. Identify the Key Traits of the Reference Person:

Begin by reading and understanding the information provided about the Reference Person. Highlight or take note of key traits, preferences, or characteristics that define their opinions on the topic.
List Out Key Traits for Each Person x:

For each "Person x" provided in the "other_agents_description", list out their key traits or opinions related to the topic. This will help in making a side-by-side comparison.
Compare Each Person x to the Reference Person:

Systematically compare the traits of each "Person x" to those of the Reference Person. Consider similarities, differences, and the overall alignment of opinions.
Rank Each Person x Based on Similarity:

Rank each "Person x" based on how closely their opinions match the Reference Person's opinions. This step might involve weighing certain opinions or traits more heavily than others, depending on the significance or emphasis placed on them in the descriptions.
Select the Person x with the Highest Similarity:

Based on your comparison and ranking, choose the "Person x" whose views align most closely with those of the Reference Person. If two or more persons seem equally close, use any additional nuances or subtleties in the descriptions to make an informed decision, or otherwise, make your best guess as directed.\n"""

CoT_w_few_shot = f"""{few_shot} + {CoT} + \nApplying this process to example 3:

The Reference Person enjoys fiction novels, particularly mysteries and thrillers, likes literary festivals, and appreciates classic literature.
Person 0 enjoys non-fiction, occasionally reads mystery novels, doesn't like thrillers, and rarely attends literary events. Person 1 loves thrillers, attends book launch events, and has a collection of modern literature.
Person 0 has some alignment with mystery novels but diverges in other areas, while Person 1 has stronger alignment in the genre preferences.
Person 1 seems to align more closely overall.
Choose Person 1 as the answer."""




class BasicComparer(Comparer):
    prompt_templates = {
        "basic": PROMPT_BASIC + END_OF_PROMPT + last_reponse,
        'few_shot':PROMPT_SKELETON+few_shot + END_OF_PROMPT + last_reponse,
        'CoT':PROMPT_SKELETON+CoT+END_OF_PROMPT + last_reponse,
        'CoT_w_few_shot':PROMPT_SKELETON+CoT_w_few_shot+END_OF_PROMPT + last_reponse
    }

    prompt_type_parse_key = dict()

    def __init__(self, *, id, prompt_type: str, model=DEFAULT_MODEL, **kwargs):
        self.prompt_template = self.__class__.prompt_templates[prompt_type]

        super().__init__(id=id, prompt_type=prompt_type, model=model, **kwargs)


class UnitTestComparer(Comparer):
    ### NOTE: THIS DOES NOT WORK, it crashed find_nearest_neighbors when I tried to do the unit test
    prompt_templates = {
        "closer_num": """Consider the number {center_agent_description}. Which of the following numbers in the list is CLOSEST to {center_agent_description}? In the case of a tie pick randomly. Here is the list of numbers:\n{other_agents_description}\nRespond by writing the index of the number in the list and nothing else. (For example, if a list entry says Number X: Y return X.)"""
    }

    prompt_type_parse_key = dict()

    def __init__(self, *, id, prompt_type: str, model=DEFAULT_MODEL, **kwargs):
        self.prompt_template = self.__class__.prompt_templates[prompt_type]

        super().__init__(
            id=id,
            prompt_type=prompt_type,
            model=model,
            person_label="Number",
            **kwargs,
        )
