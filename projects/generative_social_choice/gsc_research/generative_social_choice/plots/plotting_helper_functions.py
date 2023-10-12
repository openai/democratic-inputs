import os


def detect_data_source(filename) -> str:
    filename = str(filename)
    for potential_dataset_name in filename.split("__"):
        if potential_dataset_name == "changemyview":
            for potential_seed in filename.split("__"):
                if "seed_" in potential_seed:
                    seed = int(potential_seed.replace("seed_", ""))
                    return ("changemyview", seed)
            else:
                raise ValueError("could not detect seed")
        if potential_dataset_name == "minimumwage":
            return ("minimumwage", None)
        if potential_dataset_name == "bowlinggreen":
            return ("bowlinggreen", None)
    else:
        raise ValueError("could not detect data source")


def get_graph_path(*, folder_name):
    files = os.listdir(folder_name)
    for file in files:
        if file[-2:] == "__":
            return file + "/graph.csv"
    else:
        raise FileNotFoundError
