from generative_social_choice.objects.abstract_agents import Moderator, Agent
from generative_social_choice.utils.helper_functions import (
    get_time_string,
    get_base_dir_path,
)
from generative_social_choice.objects.agent_helper_functions import (
    query2_output_implies_agreement,
)
import pandas as pd
import os
from typing import List, Optional, Literal
import math
import numpy as np
from scipy.special import softmax


def make_slate_dir(
    *,
    algorithm_type: str,  # JR or EJR
    experiment_type,  # just a label for the folder, usually call it after dataset
    seed: Optional[int],
    query1_prompt_type,
    k,
    log_dir_name,
):
    seed_str = f"seed_{seed}" if seed else ""
    full_log_dir_name = (
        get_base_dir_path()
        / log_dir_name
        / f"{get_time_string()}__{experiment_type}__{seed_str}__{algorithm_type}__{query1_prompt_type}__{k}"
    )
    os.mkdir(full_log_dir_name)
    return full_log_dir_name


def generate_anneal_jr_slate(
    *,
    agents: List[Agent],
    moderator: Moderator,
    k: int,
    max_steps_coeff: float = 5,
    log_dir_name: str = "experiments/1stage_process_eval/",
    experiment_type: str,
    **kwargs,
):
    """
    Algorithm idea:
    - If there are >= n/k uncovered agents, use query1 on the uncovered agents and add a statement to the slate
    - Otherwise, randomly pick a committee member to remove (higher removal prob to slices with size far from n/k)
    The hope is if we do this a bunch, we end up with a slate where each statement covers about n/k people. In particular,
    we hopefully wash out the bland generic statements and get more specific statements.
    Some TODO items: - tweak the end conditions so that we guarantee JR
                     - tweak the end conditions so that we end up with a slate of size k

    Inputs
    - agents: list of agents
    - moderator: Query1 moderator
    - k: target slate size
    - max_slice_coeff: trying to return a slate with no slice with more than max_slice_coeff*n/k support
    - max_steps_coeff: doing at most max_steps_coeff*k generation steps
    - log_dir_name: dir name where to log, should start with experiments/
    - experiment_type: this will be the short name in the log dir name

    Outputs:
    - dict mapping slate item (statement) to list of agent ids which support that slate item.
    """
    ##### Setup for logging ####
    query1_prompt_type = moderator.prompt_type
    query2_prompt_type = agents[0].prompt_type
    print("Running JR...")
    seed = int(kwargs["seed"]) if "seed" in kwargs else None
    full_log_dir_name = make_slate_dir(
        algorithm_type="AnnealJR",
        experiment_type=experiment_type,
        seed=seed,
        query1_prompt_type=query1_prompt_type,
        k=k,
        log_dir_name=log_dir_name,
    )
    log_filename = str(full_log_dir_name / "logs.csv")
    raw_logs = []
    #### Initialize values ####
    n = len(agents)
    uncovered_agents = set(agents)
    committee = set()
    committee_supporters = dict()
    for i in range(max_steps_coeff * k):
        temperature = (max_steps_coeff * k - i) / k
        print(f"Step {i+1}: (current committee {committee_supporters})")
        if len(uncovered_agents) >= n / k:  # Add a new statement to the slate
            # Have some Moderator GPTCaller run query1
            query1_response, query1_full_output = moderator.query1(
                agents=uncovered_agents
            )
            # Log query1
            raw_logs.append({**query1_full_output, "query_type": "query1"})
            pd.DataFrame(raw_logs).to_csv(log_filename)
            print(f"Query 1 response: {query1_response}")
            committee.add(query1_response)
            committee_supporters[query1_response] = []
            newly_covered_agents = set()
            # Go through agents and see who is covered by new Query1 output
            for agent in agents:
                print(
                    f"Testing agent {agent.get_id()} (comment={agent.get_description()})"
                )
                query2_output, query2_full_output = agent.get_approval(
                    comment=query1_response
                )
                # Log Query2 outputs
                raw_logs.append({**query2_full_output, "query_type": "query2"})
                pd.DataFrame(raw_logs).to_csv(log_filename)
                # If covered by new Query1 statement, remove from uncovered agents
                print(f"Response: {query2_output}")
                if query2_output_implies_agreement(
                    query2_output=query2_output,
                    query2_prompt_type=query2_prompt_type,
                ):
                    if agent in uncovered_agents:
                        print(f"Removing agent {agent.get_id()}")
                        newly_covered_agents.add(agent)
                    committee_supporters[query1_response].append(agent.get_id())
            uncovered_agents.difference_update(newly_covered_agents)
        elif len(uncovered_agents) < n / k:  # Remove statement from slate
            # badness = how far away the # supporters is from n/k
            committee_member_badness_score = [
                max(
                    len(committee_supporters[committee_member]) / (n / k),
                    (n / k) / len(committee_supporters[committee_member]),
                )
                / temperature
                for committee_member in committee
            ]
            # Randomly select committee member to remove
            committee_member = np.random.choice(
                list(committee), p=softmax(committee_member_badness_score)
            )
            # Remove committee member
            committee.remove(committee_member)
            removed_supporters = committee_supporters.pop(committee_member)
            # Update uncovered_agents to add back in people who are no longer covered
            for agent in agents:
                if agent.get_id() in removed_supporters:
                    print(f"agent {agent.get_id()} is no longer uncovered...")
                    uncovered_agents.add(agent)
    # Log final committee to txt file
    with open(full_log_dir_name / "committee.txt", "w") as f:
        f.write(str(committee_supporters))
    return committee_supporters


def generate_balanced_jr_slate(
    *,
    agents: List[Agent],
    moderator: Moderator,
    k: int,
    log_dir_name: str = "experiments/1stage_process_eval/",
    experiment_type: str,
    **kwargs,
):
    """
    Generate a JR slate where, whenever we add a statement, we only consider covered the n/k agents who approve it the most.
    """
    ##### Setup for logging ####
    query1_prompt_type = moderator.prompt_type
    query2_prompt_type = agents[0].prompt_type
    print("Running balanced JR...")
    seed = int(kwargs["seed"]) if "seed" in kwargs else None
    full_log_dir_name = make_slate_dir(
        algorithm_type="JR",
        experiment_type=experiment_type,
        seed=seed,
        query1_prompt_type=query1_prompt_type,
        k=k,
        log_dir_name=log_dir_name,
    )
    log_filename = str(full_log_dir_name / "logs.csv")
    raw_logs = []
    #### Initialize values ####
    uncovered_agents = set(agents)
    committee = set()
    committee_supporters = dict()
    for i in range(k):
        print(f"Step {i+1}: (current committee {committee_supporters})")
        if len(uncovered_agents) < len(agents) // k:
            break
        # Have some Moderator GPTCaller run query1
        query1_response, query1_full_output = moderator.query1(agents=uncovered_agents)
        # Log query1
        raw_logs.append({**query1_full_output, "query_type": "query1"})
        pd.DataFrame(raw_logs).to_csv(log_filename)
        print(f"Query 1 response: {query1_response}")
        committee.add(query1_response)
        committee_supporters[query1_response] = []
        # Go through uncovered agents and compute approval levels
        agent_to_approval_level = dict()
        for agent in uncovered_agents:
            print(f"Testing agent {agent.get_id()} (comment={agent.get_description()})")
            query2_output, query2_full_output = agent.get_approval(
                comment=query1_response
            )
            print(f"Response: {query2_output}")
            agent_to_approval_level[agent] = query2_output
            # Log Query2 outputs
            raw_logs.append({**query2_full_output, "query_type": "query2"})
            pd.DataFrame(raw_logs).to_csv(log_filename)
        # Add to committee the n/k agents who approve the statement the most
        print(f"agent_to_approval_level={agent_to_approval_level}")
        num_agents_in_cluster = len(agents) // k
        cluster_agents = set(
            sorted(
                agent_to_approval_level,
                key=lambda x: agent_to_approval_level[x],
                reverse=True,
            )[:num_agents_in_cluster]
        )
        print(f"cluter_agents={cluster_agents}")
        committee_supporters[query1_response] = {
            cluster_agent: agent_to_approval_level[cluster_agent]
            for cluster_agent in cluster_agents
        }
        uncovered_agents.difference_update(cluster_agents)

    # Log final committee to txt file
    with open(full_log_dir_name / "committee.txt", "w") as f:
        f.write(str(committee_supporters))
        f.write("\n\n\n")
        f.write(str(list(committee_supporters.keys())))
    return committee_supporters


def generate_jr_slate(
    *,
    agents: List[Agent],
    moderator: Moderator,
    k: int,
    log_dir_name: str = "experiments/1stage_process_eval/",
    experiment_type: str,
    **kwargs,
):
    ##### Setup for logging ####
    query1_prompt_type = moderator.prompt_type
    query2_prompt_type = agents[0].prompt_type
    print("Running JR...")
    seed = int(kwargs["seed"]) if "seed" in kwargs else None
    full_log_dir_name = make_slate_dir(
        algorithm_type="JR",
        experiment_type=experiment_type,
        seed=seed,
        query1_prompt_type=query1_prompt_type,
        k=k,
        log_dir_name=log_dir_name,
    )
    log_filename = str(full_log_dir_name / "logs.csv")
    raw_logs = []
    #### Initialize values ####
    uncovered_agents = set(agents)
    committee = set()
    committee_supporters = dict()
    for i in range(k):
        print(f"Step {i+1}: (current committee {committee_supporters})")
        if not uncovered_agents:
            break
        # Have some Moderator GPTCaller run query1
        query1_response, query1_full_output = moderator.query1(agents=uncovered_agents)
        # Log query1
        raw_logs.append({**query1_full_output, "query_type": "query1"})
        pd.DataFrame(raw_logs).to_csv(log_filename)
        print(f"Query 1 response: {query1_response}")
        committee.add(query1_response)
        committee_supporters[query1_response] = []
        newly_covered_agents = set()
        # Go through agents and see who is covered by new Query1 output
        for agent in agents:
            print(f"Testing agent {agent.get_id()} (comment={agent.get_description()})")
            query2_output, query2_full_output = agent.get_approval(
                comment=query1_response
            )
            # Log Query2 outputs
            raw_logs.append({**query2_full_output, "query_type": "query2"})
            pd.DataFrame(raw_logs).to_csv(log_filename)
            # If covered by new Query1 statement, remove from uncovered agents
            print(f"Response: {query2_output}")
            if query2_output_implies_agreement(
                query2_output=query2_output,
                query2_prompt_type=query2_prompt_type,
            ):
                if agent in uncovered_agents:
                    print(f"Removing agent {agent.get_id()}")
                    newly_covered_agents.add(agent)
                committee_supporters[query1_response].append(agent.get_id())
        uncovered_agents.difference_update(newly_covered_agents)
    # Log final committee to txt file
    with open(full_log_dir_name / "committee.txt", "w") as f:
        f.write(str(committee_supporters))
    return committee_supporters


def generate_ejr_slate(
    *,
    agents: List[Agent],
    query1_moderator: Moderator,
    query1_prime_moderator: Moderator,
    k: int,
    experiment_type: str,
    log_dir_name: str = "experiments/jr_and_ejr_eval/",
    **kwargs,
):
    ### Logging setup ###
    print("Running EJR...")
    seed = int(kwargs["seed"]) if "seed" in kwargs else None
    full_log_dir_name = make_slate_dir(
        algorithm_type="EJR",
        experiment_type=experiment_type,
        seed=seed,
        query1_prompt_type=query1_moderator.prompt_type,
        k=k,
        log_dir_name=log_dir_name,
    )
    log_filename = str(full_log_dir_name / "logs.csv")
    raw_logs = []
    #### Initialize for algorithm ####
    agent_to_num_approved = {agent: 0 for agent in agents}
    committee = set()
    committee_supporters = dict()
    n = len(agents)
    l = k
    while l >= 1:
        potential_supporters = [
            agent for agent in agent_to_num_approved if agent_to_num_approved[agent] < l
        ]
        # Have some Moderator GPTCaller run query1 or query1_prime
        query1_type = ""
        if len(committee) == 0:
            # Run query1
            query1_response, query1_full_output = query1_moderator.query1(
                agents=potential_supporters,
            )
            query1_type = "query1"
        else:
            # Run query1', there are comments to exclude
            query1_response, query1_full_output = query1_prime_moderator.query1_prime(
                agents=potential_supporters,
                excluded_comments=list(committee),
            )
            query1_type = "query1_prime"
        # Log query1
        raw_logs.append({**query1_full_output, "query_type": query1_type, "l": l})
        pd.DataFrame(raw_logs).to_csv(log_filename)
        # Add query1 response to committee
        print(f"Query 1 response: {query1_response}")

        agent_to_query1_response_approval = {}
        for agent in agents:
            print(
                f"Testing whether agent {agent.get_id()} (comment={agent.get_description()}) supports new addition"
            )
            query2_output, query2_full_output = agent.get_approval(
                comment=query1_response
            )
            # Log Query2 outputs
            raw_logs.append({**query2_full_output, "query_type": "query2"})
            pd.DataFrame(raw_logs).to_csv(log_filename)

            # Check whether query2 supports or not

            agent_to_query1_response_approval[agent] = query2_output_implies_agreement(
                query2_output=query2_output,
                query2_prompt_type=agent.prompt_type,
            )

        # If >= l n/k people approve this new statement:
        num_approve = len(
            [
                agent
                for agent in potential_supporters
                if agent_to_query1_response_approval[agent]
            ]
        )
        if num_approve >= l * n / k:
            # Add statement to committee
            committee.add(query1_response)
            committee_supporters[query1_response] = []
            # Update agent_to_num_approved
            for agent in agent_to_query1_response_approval:
                if agent_to_query1_response_approval[agent]:
                    committee_supporters[query1_response].append(agent.get_id())
                    agent_to_num_approved[agent] += 1
        else:
            raw_logs.append({"l": l})
            pd.DataFrame(raw_logs).to_csv(log_filename)
            print(
                f"Decreasing l={l} to {l-1}...(i.e. didn't find statement with suff high support so lowering bar)"
            )
            l -= 1
    # Log final committee to txt file
    with open(full_log_dir_name / "committee.txt", "w") as f:
        f.write(str(committee_supporters))
    return committee_supporters


def generate_slate(
    *,
    algorithm_type: Literal["EJR", "JR", "BalancedJR"],
    agents: List[Agent],
    query1_moderator: Moderator,
    query1_prime_moderator: Moderator,
    k: int,
    experiment_type: str,
    log_dir_name: str = "experiments/jr_and_ejr_eval/",
    **kwargs,
):
    if algorithm_type == "JR":
        return generate_jr_slate(
            agents=agents,
            moderator=query1_moderator,
            k=k,
            log_dir_name=log_dir_name,
            experiment_type=experiment_type,
            **kwargs,
        )
    elif algorithm_type == "EJR":
        return generate_ejr_slate(
            agents=agents,
            query1_moderator=query1_moderator,
            query1_prime_moderator=query1_prime_moderator,
            k=k,
            experiment_type=experiment_type,
            log_dir_name=log_dir_name,
            **kwargs,
        )
    elif algorithm_type == "BalancedJR":
        return generate_balanced_jr_slate(
            agents=agents,
            moderator=query1_moderator,
            k=k,
            log_dir_name=log_dir_name,
            experiment_type=experiment_type,
            **kwargs,
        )
    else:
        raise ValueError(f"Invalid algorthm_type {algorithm_type}")
