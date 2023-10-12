from generative_social_choice.utils.helper_functions import get_base_dir_path
from ast import literal_eval
from generative_social_choice.plots.jr_and_ejr_eval.boxes_plots.helper_functions_boxes_plots import (
    visualize_approval_matrix,
    generate_matrix,
)
from generative_social_choice.plots.plotting_helper_functions import detect_data_source
from generative_social_choice.objects.agents import CMVSetup
import pandas as pd
from generative_social_choice.datasets.datasets import get_dataset
import os

polis_dataset = get_dataset("polis")

directory_path = """../jr_and_ejr_eval/"""
# Get a list of all items in the directory
items = os.listdir(directory_path)
# Filter only the folders (directories)
folders = [item for item in items if os.path.isdir(os.path.join(directory_path, item))]

all_comments = []
# Iterate over the folders
for folder in folders:
    print("Folder:", folder)
    committee_filename = (
        """
	llm-deliberation/generative_social_choice/experiments/jr_and_ejr_eval/"""
        + folder
        + """/committee.txt"""
    )
    committee_filename = (
        get_base_dir_path()
        / committee_filename.replace("\n", "").split("generative_social_choice/")[-1]
    )
    print(committee_filename)

    # committee_filename = """
    # llm-deliberation/generative_social_choice/experiments/jr_and_ejr_eval/2023-08-15-15:30:33__changemyview__seed_363__JR__cmv_basic__5/committee.txt
    # """
    # committee_filename = (
    #     get_base_dir_path()
    #     / committee_filename.replace("\n", "").split("generative_social_choice/")[-1]
    # )
    try:
        dataset_name, seed = detect_data_source(committee_filename)
    except ValueError:
        continue
    # Compute agent ids
    if dataset_name == "changemyview":
        agents = CMVSetup.get_agents_from_seed(seed=seed)
        agent_ids = [agent.get_id() for agent in agents]
    elif dataset_name == "minimumwage":
        agent_ids = polis_dataset.get_good_author_ids(issue="15-per-hour-seattle")

    with open(committee_filename, "r") as f:
        committee = literal_eval(f.read())

    data = {
        comment: [1 if agent_id in committee[comment] else 0 for agent_id in agent_ids]
        for comment in committee.keys()
    }
    df = pd.DataFrame(data, index=agent_ids).transpose()

    plot_name_list = folder.split("__")
    plot_name_reordering = (
        plot_name_list[1]
        + "__"
        + "__".join(plot_name_list[3:])
        + "__"
        + plot_name_list[0]
        + "__"
        + plot_name_list[2]
    )
    # print(plot_name_reordering)
    # visualize_approval_matrix(df.values,  filename="plots/ApprovalMatrix/"+plot_name_reordering)

    single_comment = ""
    for comment in committee.keys():
        single_comment += comment + "\n\n"
    all_comments.append(plot_name_reordering + "\n\n" + single_comment)

# Specify the file path
file_path = "all_comments.txt"
sorted_list = sorted(all_comments)

# Open the file in write mode
with open(file_path, "w") as file:
    # Write content to the file
    for comment in sorted_list:
        file.write(comment)
        file.write("\n\n\n\n")
