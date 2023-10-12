from collections import Counter
import textwrap
from pathlib import Path
import os
from datetime import datetime
from tabulate import tabulate
import hashlib
from bs4 import BeautifulSoup


def html_to_text(html_string):
    soup = BeautifulSoup(html_string, "html.parser")
    text = soup.get_text()
    text = text.replace("\r", "")
    return text


def arg_name_to_full_name(arg):
    if arg == "bowlinggreen":
        return "american-assembly.bowling-green"
    elif arg == "minimumwage":
        return "15-per-hour-seattle"
    elif arg == "changemyview":
        return "climate_change"
    else:
        raise ValueError("invalid dataset")


def detect_dataset(folder):
    folder = str(folder)
    if "seattle" in folder:
        return "minimumwage"
    elif "bowling" in folder:
        return "bowlinggreen"
    elif "climate" in folder or "cmv" in folder:
        return "changemyview"
    else:
        raise ValueError


def df_to_table(df, max_rows=None, max_col_width=None):
    return tabulate(
        df.iloc[:max_rows], headers="keys", tablefmt="grid", maxcolwidths=max_col_width
    )


def dfprint(df, max_rows=None, max_col_width=30):
    print("total n rows : ", df.index.size)
    print(df_to_table(df=df, max_rows=max_rows, max_col_width=max_col_width))


def get_base_dir_path():
    """
    Returns local system path to the directory where the llm-deliberation package is.
    So, this is the directory where utils/, datasets/, experiments/ etc are.
    """
    base_dir_name = "generative_social_choice"

    path = Path(os.path.abspath(os.path.dirname(__file__)))
    current_path_parts = list(path.parts)
    base_dir_idx = (
        len(current_path_parts) - current_path_parts[::-1].index(base_dir_name) - 1
    )

    base_dir_path = Path(*current_path_parts[: 1 + base_dir_idx])
    return base_dir_path


def get_time_string():
    now = datetime.now()
    time_string = now.strftime("%Y-%m-%d-%H:%M:%S")

    return time_string


def wprint(text, width=80):
    if type(text) is list:
        text = "[\n" + "\n\n------------\n\n".join(text) + "\n]"

    lines = text.split("\n")
    wrapped_lines = [textwrap.fill(line, width=width) for line in lines]
    wrapped_text = "\n".join(wrapped_lines)
    print(wrapped_text)


def assign_ids(names):
    counter = Counter(names)

    ids_to_name = {}
    for name, n in counter.items():
        for i in range(n):
            ids_to_name[name + " " + str(i + 1) + ":" + str(n)] = name

    return ids_to_name


def bullet_string_to_list(bullet_list_string):
    bullet_list = bullet_list_string.splitlines()
    bullet_list = [item.strip("- ") for item in bullet_list if item.strip()]
    return bullet_list


def bullet_list_to_string(bullet_list):
    bullet_list_string = "\n".join(["- " + item for item in bullet_list])
    return bullet_list_string


def bullet_list_to_string_pretty(string_list):
    bullet_list = [
        '• "' + s.replace("\n", " ").replace("\r", "") + '"' for s in string_list
    ]
    bullet_string = "\n\n".join(bullet_list)

    return bullet_string


def bullet_list_to_string_numbered(bullet_list, numbering=None):
    output = ""
    if numbering == None:
        numbering = range(1, len(bullet_list) + 1)
    for num, item in zip(numbering, bullet_list):
        output += f"({num}) {item}\n"
    return output


def comment_to_agent_id(comment: str) -> int:
    # really hoping no collisions here lol
    return int(hashlib.sha1(comment.encode("utf-8")).hexdigest(), 16) % (10**8)
