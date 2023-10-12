from generative_social_choice.utils.helper_functions import get_base_dir_path
from ast import literal_eval

import os

directory_path = """."""
# Get a list of all items in the directory
items = os.listdir(directory_path)
# Filter only the folders (directories)
folders = [item for item in items if os.path.isdir(os.path.join(directory_path, item))]

all_comments = []
# Iterate over the folders
for folder in folders:
    print("Folder:", folder)
    committee_filename = folder + """/generated_comments.txt"""
    #    committee_filename = (
    #     get_base_dir_path()
    #     / committee_filename.replace("\n", "").split("generative_social_choice/")[-1]
    # )
    print(committee_filename)

    try:
        with open(committee_filename, "r") as f:
            committee = literal_eval(f.read())
    except FileNotFoundError:
        continue

    name_list = folder.split("__")
    name_reordering = (
        name_list[1]
        + "__"
        + "__".join(name_list[3:])
        + "__"
        + name_list[0]
        + "__"
        + name_list[2]
    )

    single_comment = ""
    for comment in committee:
        single_comment += comment + "\n\n"
    all_comments.append(name_reordering + "\n\n" + single_comment)

# Specify the file path
file_path = "all_comments.txt"
sorted_list = sorted(all_comments)

# Open the file in write mode
with open(file_path, "w") as file:
    # Write content to the file
    for comment in sorted_list:
        file.write(comment)
        file.write("\n\n\n\n")
