import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import os
import matplotlib.ticker as ticker


# Define a function to format tick labels as integers
def format_ticks_as_int(value, pos):
    return int(value)


# Replace this with loading your actual DataFrame
base_color = "#3753A5"
palette = sns.light_palette(base_color, 15)

directory_path = "../../experiments/generate_wo_ex_unsupervised/"
plot_save_dir = "histograms"

# List all entries in the directory
entry_list = os.listdir(directory_path)

font_size = 35

# Iterate through the entries and identify directories
directory_list = []
for entry in entry_list:
    entry_path = os.path.join(directory_path, entry)
    if os.path.isdir(entry_path):
        directory_list.append(entry)

for directory in directory_list:
    filename = os.path.join(directory_path, directory, "results.csv")
    df = pd.read_csv(filename)
    # Calculate the difference between columns "value1" and "value2"
    df["diff_column"] = df["query1_approval"] - df["max_approval"]
    # Group the DataFrame by the "query1_size" column
    grouped = df.groupby("query1_size")

    # Create a figure with subplots
    fig, axes = plt.subplots(nrows=1, ncols=len(grouped), figsize=(20, 7))

    # groups_for_plotting = []
    # Iterate through the groups and print them
    i = 0
    binwidth = 1
    for name, group in grouped:
        print(f"Group {name}:")
        print()
        tick_marks = np.arange(df["diff_column"].min(), df["diff_column"].max() + 1)
        bin_edges = tick_marks - binwidth / 2
        # Filter the data for negative values
        negative_data = group[group["diff_column"] < 0]

        zero_data = group[group["diff_column"] == 0]
        # sns.barplot(data=group, x="diff_column", ax=axes[i], color="blue", orientation="horizontal")
        sns.histplot(
            data=group, y="diff_column", ax=axes[i], color=base_color, bins=bin_edges
        )
        sns.histplot(
            data=zero_data,
            y="diff_column",
            ax=axes[i],
            color=palette[7],
            bins=bin_edges,
        )
        sns.histplot(
            data=negative_data,
            y="diff_column",
            ax=axes[i],
            color=palette[3],
            bins=bin_edges,
        )

        axes[i].set_title("|S|=" + str(name), fontsize=40)
        # Set y-labels for the histograms
        axes[i].set_ylabel("")
        axes[i].set_xlabel("")
        axes[i].set_ylim(tick_marks.min() - 0.5, tick_marks.max())
        # Get the y-axis formatter
        x_formatter = ticker.FuncFormatter(format_ticks_as_int)

        # Apply the formatter to the y-axis
        axes[i].xaxis.set_major_formatter(x_formatter)
        # Get the y-axis formatter
        y_formatter = ticker.FuncFormatter(format_ticks_as_int)

        # Apply the formatter to the y-axis
        axes[i].yaxis.set_major_formatter(y_formatter)

        i += 1

    for ax in axes:
        ax.tick_params(
            axis="both", which="both", labelsize=font_size
        )  # Adjust fontsize as needed

    # Adjust layout
    plt.tight_layout()

    # Adjust layout with subplots_adjust
    plt.subplots_adjust(left=0.1, bottom=0.18, right=0.9, top=0.9, wspace=0.4)

    # Add a common x-label and y-label using fig.text()
    fig.text(0.5, 0.05, "Count", ha="center", va="center", fontsize=40)
    fig.text(
        0.05,
        0.5,
        "Gains from Query",
        ha="center",
        va="center",
        rotation="vertical",
        fontsize=40,
    )

    # Create a new directory
    os.makedirs(plot_save_dir, exist_ok=True)
    plt.savefig(os.path.join(plot_save_dir, directory + ".pdf"), dpi=300)
    plt.clf()
