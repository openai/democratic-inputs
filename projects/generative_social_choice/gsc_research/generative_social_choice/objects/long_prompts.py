CMV_PROMPT_EXAMPLES = """

Opinion (what person believes):
"{user_comment}"

Statement:  
"{prop_comment}"

Answer (whether person feels represented by the statement, based on their above opinion): {approval}
"""

CMV_PROMPT_QUERY2 = """Consider a group of people deliberating on a topic. In particular, they are responding the the following comment:

"{post_title}"

Your tasks is to determine whether a particular person would feel represented by a given statement. Below I will provide some example tasks, in which I will give you the following information: 1) an opinion some particular person has, and 2) a statement somebody else made. Given this information, the task is to determine whether the person would feel represented by the statement, based on the opinion they expressed. This is a yes-no question, the only two valid answers to the task are "Yes" (the person would feel represented by the statement) or "No" (the person would not feel represented by the statement). 

{examples}

This concludes the example tasks. Now it is your turn to solve a task. Your response should be just "Yes" or "No" and nothing else. 

{incomplete_example}
"""

CMV_PROMPT_QUERY1 = """Consider a group of people deliberating on a topic. In particular, they are responding the the following comment:

"{post_title}"

Each participant has expressed an opinion, and your task is to generate a statement such that as many participants as possible feel represented by that statement. To illustrate what I mean by "feel represented", I give you a few examples in the following.  Each example consists of a participant's opinion, a statement, and the answer to the question whether the participant who expressed the opinion would feel represented by the statement:

{examples}

These examples hopefully made it clear what it means for participants to "feel represented" by a statement. Now I give you a list of participants' opinions, afterwards I will ask you to generate a statement such that as many participants as possible feel represented:

{agent_opinion_list}

Given these opinions expressed by the participants, write now a statement such that as many participants as possible feel represented by that statement. Make the statement precise and short, no more than three sentences.
"""


CMV_PROMPT_QUERY1_COT_NO_FEWSHOT = """Below is a list of people with various opinions on a topic. Follow the following steps: 
1. Determine what topic they are discussing. What are the key axes of disagreement here?
2. For each person, give them a number and write down what their main beliefs are, and how they compare to the crowd. 
3. Reflect on which opinions are commonly held and which opinions are less commonly held. Where might people find common ground? 
4. Write a single specific statement that the most possible people would feel FULLY REPRESENTED by. You should try to find common ground among the different opinions. But also, the statement you generate should not be wishy-washy: it should represent a single specific viewpoint on the topic. It should sound like an opinionated statement one of the people in the list would make. Of course, not everyone can be fully represented by a single statement, I just one you to generate one statement which fully represents the most people possible. (Don't worry that some people will not be represented yet, I will ask you later to generate statements which represent the remaining people.) Now here is the list of people and their opinions:\n{agent_opinion_list}\nThis concludes the list of people, now start following the steps. Your output should be a Python dictionary with key-val pairs: "STEP 1": \"\"\"<writing for step 1>\"\"\", "STEP 2": \"\"\"<writing for step 2>\"\"\", "STEP 3":, \"\"\"<writing for step 3>\"\"\", "STEP 4": \"\"\"<writing for step 4>\"\"\". Format your Python dict with curly braces at the beginning and end and NEVER write newlines. Only write the Python dict and nothing else."""


CMV_PROMPT_QUERY1_PRIME = """Consider a group of people deliberating on a topic. In particular, they are responding the the following comment:

"{post_title}"

Each participant has expressed an opinion, and your task is to generate a statement such that as many participants as possible feel represented by that statement. To illustrate what I mean by "feel represented", I give you a few examples in the following.  Each example consists of a participant's opinion, a statement, and the answer to the question whether the participant who expressed the opinion would feel represented by the statement:

{examples}

These examples hopefully made it clear what it means for participants to "feel represented" by a statement. Now I give you a list of participants' opinions, afterwards I will ask you to generate a statement such that as many participants as possible feel represented:

{agent_opinion_list}

Remember, your task is to generate a statement such that as many participants as possible in this above list feel represented. However, and this is VERY important, the statement you generate should not be anything close to the statements written below: 

{excluded_comments_list}

Given the opinions expressed by the participants, and the list of statements you are NOT allowed to write, write now a statement such that as many participants as possible feel represented by that statement. Make the statement precise and short, no more than three sentences. 
"""

CMV_PROMPT_QUERY1_PRIME_2 = """Consider a group of people deliberating on a topic. In particular, they are responding the the following comment:

"{post_title}"

Each participant has expressed an opinion, and your task is to generate a statement such that as many participants as possible feel represented by that statement. To illustrate what I mean by "feel represented", I give you a few examples in the following.  Each example consists of a participant's opinion, a statement, and the answer to the question whether the participant who expressed the opinion would feel represented by the statement:

{examples}

These examples hopefully made it clear what it means for participants to "feel represented" by a statement. Now I give you a list of participants' opinions, afterwards I will ask you to generate a statement such that as many participants as possible feel represented:

{agent_opinion_list}

Remember, your task is to generate a statement such that as many participants as possible in this above list feel represented. However, and this is VERY important, the statement you generate should not be anything close to the statements written below in the forbidden list. If your statement at all resembles a statement in the forbidden list, that is very bad. So this is the challenge: you must represent the participants in the above list, with a statement which is nothing like anything in the below forbidden list. Now here is the forbidden list: 

{excluded_comments_list}

Given the opinions expressed by the participants, and the list of statements you are NOT allowed to write, write now a statement such that as many participants as possible feel represented by that statement. Make the statement precise and short, no more than three sentences. 
"""


CMV_PROMPT_QUERY1_PRIME_COT_NO_FEWSHOT = """Below is a list of people with various opinions on a topic. Follow the following steps: 
1. Determine what topic they are discussing. What are the key axes of disagreement here?
2. For each person, give them a number and write down what their main beliefs are, and how they compare to the crowd. 
3. Reflect on which opinions are commonly held and which opinions are less commonly held. Where might people find common ground?
4. Write a single specific statement that the most possible people would feel FULLY REPRESENTED by. You should try to find common ground among the different opinions. But also, the statement you generate should not be wishy-washy: it should represent a single specific viewpoint on the topic. It should sound like an opinionated statement one of the people in the list would make. Of course, not everyone can be fully represented by a single statement, I just one you to generate one statement which fully represents the most people possible. (Don't worry that some people will not be represented yet, I will ask you later to generate statements which represent the remaining people.) Finally there is one more aspect to the challenge: the statement you generate should not be anything close to the statements written below in the forbidden list.  If your statement at all resembles a statement in the forbidden list, that is very bad. So this is the challenge: you must represent the participants in the above list, with a statement which is nothing like anything in the below forbidden list. Now here is the list of people and their opinions:

{agent_opinion_list}

This concludes the list of people. Now here is the list of forbidden statements:

{excluded_comments_list}

Now start following the steps. Your output should be a Python dictionary with key-val pairs: "STEP 1": \"\"\"<writing for step 1>\"\"\", "STEP 2": \"\"\"<writing for step 2>\"\"\", "STEP 3":, \"\"\"<writing for step 3>\"\"\", "STEP 4": \"\"\"<writing for step 4 (VERY IMPORTANT just put the statement, nothing else, and remember to not write anything similar to any statement in the forbiddden list)>\"\"\". Format your Python dict with curly braces at the beginning and end and NEVER write newlines. Only write the Python dict and nothing else."""
