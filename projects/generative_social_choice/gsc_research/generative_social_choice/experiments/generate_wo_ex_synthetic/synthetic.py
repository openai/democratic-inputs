import ast
import argparse
import os
import pickle
import re
from bisect import bisect_left, bisect_right
from collections import Counter
from itertools import combinations
from random import sample, random, seed, choice
from statistics import median, mean
from time import time
from typing import Set

import pandas as pd
import seaborn as sns
import seaborn.objects as so
from matplotlib import pyplot as plt
from scipy.stats import wilcoxon

import generative_social_choice.utils.gpt_wrapper as gpt


class Formula:
    def __init__(self):
        pass

    def __str__(self):
        return self.str

    def eval(self, offered: Set) -> bool:
        pass

class OrAnd1(Formula):
    def __init__(self, obj1, obj2, obj3):
        self.obj1 = obj1
        self.obj2 = obj2
        self.obj3 = obj3
        self.str = f"({obj1} and {obj2}) or {obj3}"

    def eval(self, offered: Set) -> bool:
        if self.obj3 in offered:
            return True
        return (self.obj1 in offered) and (self.obj2 in offered)


class And1Or(Formula):
    def __init__(self, obj1, obj2, obj3):
        self.obj1 = obj1
        self.obj2 = obj2
        self.obj3 = obj3
        self.str = f"{obj1} and ({obj2} or {obj3})"

    def eval(self, offered: Set) -> bool:
        if self.obj1 not in offered:
            return False
        return (self.obj2 in offered) or (self.obj3 in offered)


def random_formula(variables):
    obj1, obj2, obj3 = sample(variables, 3)
    if random() < 0.5:
        return OrAnd1(obj1, obj2, obj3)
    else:
        return And1Or(obj1, obj2, obj3)


def get_prompt(variables, agents, k, prop_logic):
    assert 0 <= k <= len(variables)
    prompt = "A school is deciding which classes to offer for a Summer program, and asked students for their opinions. "
    prompt += f"""The available subjects are {repr(variables)}, and the school can offer exactly {k} of them.
The students made the following statements:
"""
    for i, ag in enumerate(agents):
        prompt += f'Student {i+1}: "I would attend the program if and only if {ag} is offered."\n'

    if prop_logic:
        prompt += f"""\nYou should interpret these statements as propositional logic. For example, a student who mentions "({variables[0]} or {variables[1]}) and {variables[2]}" will attend if {variables[1]} and {variables[2]} but not {variables[0]} are offered, but will not attend if {variables[0]} and {variables[1]} but not {variables[2]} are offered.\n\n"""

    prompt += f"""Your task is: Which {k} subjects should the school offer such that as many students as possible will attend?\n
Please explain your answer step by step and break it down into smaller steps. Explain which students will attend based on your choice, and why it is not possible to make more students attend.
Do not write code that implements an algorithm — you're instructed to provide an answer.
The last line of your answer must begin with "OFFERED COURSES:" and then contain a Python list with {k} distinct elements of {repr(variables)}. For example, the last line might look like this:
OFFERED COURSES: {repr(list(variables)[:k])}
"""
    return prompt


class Query1Exception(Exception):
    def __init__(self, type, prompt, response):
        self.type = type
        self.prompt = prompt
        self.response = response

def run_query1(variables, agents, k, model="gpt-4", prop_logic=True):
    prompt = get_prompt(variables, agents, k, prop_logic)

    response = gpt.prompt_gpt(model=model, prompt=prompt, safemode=False)

    regex_match = re.search("OFFERED COURSES:?\s*(\\[.*?\\])", response)
    if regex_match is not None:
        answer_string = re.search("OFFERED COURSES:?\s*(\\[.*?\\])", response).group(1)
    else:
        raise Query1Exception("Regex failed.", prompt, response)

    try:
        answer = ast.literal_eval(answer_string)
    except ValueError:
        raise Query1Exception(f"Malformed list.", prompt, response)
    except SyntaxError:
        raise Query1Exception(f"Malformed list.", prompt, response)

    if len(answer) != k:
        raise Query1Exception(f"Wrong cardinality.", prompt, response)

    if len(set(answer)) != k:
        raise Query1Exception(f"Duplicate entries.", prompt, response)

    if any(var not in variables for var in answer):
        raise Query1Exception(f"Unknown subject.", prompt, response)

    return answer, prompt, response


def count_support(agents, answer):
    return sum(1 for ag in agents if ag.eval(answer))


def add_percentiles(datum, counts):
    support = datum["support"]
    min_index = bisect_left(counts, support)
    datum["quantile_pess"] = min_index / (len(counts) + 1)
    max_index = bisect_right(counts, support)
    datum["quantile_opt"] = max_index / (len(counts) + 1)
    return datum


def run_topell(variables, agents, k):
    var_counter = Counter()
    for agent in agents:
        var_counter.update({agent.obj1, agent.obj2, agent.obj3})
    return set(var for var, count in var_counter.most_common(k))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Script to run Query 1 experiments on a synthetic dataset. \
        This script represents a logic optimization problem in the context of choosing courses for a Summer school. \
        The script runs a certain number of experiments and saves their outputs to a log file and creates plots.")

    parser.add_argument('m', type=int, help="The number of subjects that can possibly be offered / propositional variables")
    parser.add_argument('n', type=int, help="The number of agents / formulas")
    parser.add_argument('k', type=int, help="The number of subjects to be offered / number of variables to set to True")
    parser.add_argument('--num_iterations', type=int, default=100,
                        help="The number of experiment iterations. Default is 100.")

    args = parser.parse_args()

    m = args.m
    n = args.n
    k = args.k
    num_iterations = args.num_iterations

    try:
        os.makedirs(f"m{m}_n{n}_k{k}")
    except FileExistsError:
        pass
    m_n_k = f"m{m}_n{n}_k{k}/"

    configs = {
               "gpt4-noprop": {"model": "gpt-4", "prop_logic": False},
              }

    variables = ["Computer Science", "Business", "Mathematics", "Mechanical Engineering",
             "Literature", "Architecture", "Global Languages", "Supplemental Resources", "Planetary Sciences",
             "Environmental Engineering", "Cognitive Sciences", "Politics", "History", "Astronautics",
             "Physics", "Economics", "Philosophy", "Engineering Systems", "Theater Arts",
             "Science Technology Society", "Health Technology", "Anthropology", "Media Studies",
             "Materials Engineering", "Biology", "Women's Studies",
             "Chemical Engineering", "Media Arts", "Bioengineering", "Chemistry", "Study Group",
             "Data Science", "Physical Education", "Concourse" ][:m]
    assert len(variables) == m, "m exceeds the number of course names set in the script."

    #sns.set_context("paper", font_scale=0.3)

    try:
        with open(m_n_k + "data.pkl", "rb") as file:
            data, exp_agents = pickle.load(file)
            print(f"Recovered {len(data)} datapoints.")
    except FileNotFoundError:
        data = {}
        exp_agents = {}

    old_data_length = None
    for exp_num in range(num_iterations):
        seed(exp_num)
        agents = [random_formula(variables) for _ in range(n)]
        if exp_num in exp_agents:
            assert exp_agents[exp_num] == ";".join(str(ag) for ag in agents)
        else:
            exp_agents[exp_num] = ";".join(str(ag) for ag in agents)

        counts = []
        possible_answers = list(combinations(variables, k))
        for alt_answer in possible_answers:
            counts.append(count_support(agents, alt_answer))
        counts.sort()
        for name, support in [("max", counts[-1])]:
            if (exp_num, name) in data:
                continue
            datum = add_percentiles({"experiment": exp_num, "name": name, "support": support}, counts)
            data[(exp_num, name)] = datum
            print(datum)

        if (exp_num, "random answer") not in data:
            seed(exp_num)
            answer = choice(possible_answers)
            datum = add_percentiles({"experiment": exp_num, "name": "random answer", "support": count_support(agents, answer)}, counts)
            data[(exp_num, "random answer")] = datum
            print(datum)

        if (exp_num, "top-ℓ") not in data:
            answer = run_topell(variables, agents, k)
            datum = add_percentiles({"experiment": exp_num, "name": "top-ℓ", "support": count_support(agents, answer)}, counts)
            data[(exp_num, "top-ℓ")] = datum
            print(datum)

        for c_name, c_info in configs.items():
            if (exp_num, c_name) in data:
                continue
            start = time()
            try:
                answer, prompt, response = run_query1(variables, agents, k, **c_info)
            except Query1Exception as e:
                duration = round(time() - start)
                datum = add_percentiles({"failure type": e.type, "experiment": exp_num, "name": c_name, "support": -1, "response length": len(e.response), "duration": duration, "prompt": e.prompt, "response": e.response}, counts)
                data[(exp_num, c_name)] = datum
                print(datum)
            else:
                duration = round(time() - start)
                datum = add_percentiles({"experiment": exp_num, "name": c_name, "support": count_support(agents, answer), "response length": len(response), "duration": duration, "prompt": prompt, "response": response}, counts)
                data[(exp_num, c_name)] = datum
                print(datum)

        if len(data) == old_data_length:  # don't plot or write files if no new data has been generated since last iteration
            continue

        with open(m_n_k + "data.pkl", "wb") as file:
            pickle.dump((data, exp_agents), file)

        df = pd.DataFrame(list(data.values()))
        df = df[df["name"].isin(["gpt4-noprop", "max", "random answer", "top-ℓ"])]
        df.set_index(["experiment", "name"])
        df.sort_values(by=["experiment", "name"], inplace=True)
        df["quantile"] = (df["quantile_pess"] + df["quantile_opt"]) / 2.
        df.to_csv(m_n_k + "log.csv", index=False)

        df_with_max = df.merge(df[df["name"] == "max"], on="experiment", suffixes=("", "_max"), validate="many_to_one")
        df_with_max = df_with_max[df_with_max["name"] != "max"]
        df_with_max["support / max support"] = df_with_max["support"] / df_with_max["support_max"]
        plt.clf()
        f = sns.catplot(data=df_with_max, x="name", y="support / max support", kind="box")
        f.savefig(m_n_k + "relative_support_boxes.pdf")


        plt.clf()
        f = so.Plot(df, y="support").facet(col="name").add(so.Bars(), so.Hist(bins=[i - 0.5 for i in range(n + 2)], common_norm=False)).share(x=False).theme({"figure.figsize": (10, 10)})
        try:
            f.save(m_n_k + "support_hist.pdf")
        except ValueError:
            print("Failed to write support_hist.pdf")

        plt.clf()
        f = so.Plot(df, x="quantile", y="name").add(so.Dots(marker="+"), so.Jitter(.5)).theme({"figure.figsize": (10, 10)})
        f.save(m_n_k + "quantile_strip.pdf")

        old_data_length = len(data)