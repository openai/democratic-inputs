import os
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import matplotlib.patches as mpatches
import os
import numpy as np
import sys
import traceback
import ipdb
from generative_social_choice.utils.helper_functions import (
    detect_dataset,
    get_base_dir_path,
)


def set_font_properties(ax):
    for item in (
        [ax.title, ax.xaxis.label, ax.yaxis.label]
        + ax.get_xticklabels()
        + ax.get_yticklabels()
    ):
        item.set_fontsize(20)
        item.set_family("Times New Roman")


def plot_figure_one(file_path, save=False):
    df = pd.read_csv(
        file_path,
        index_col=0,
    )

    # Aggregate data
    grouped = df.groupby("query1_size")

    query1_gt_max = grouped.apply(
        lambda x: sum(x["query1_approval"] > x["max_approval"])
    ).to_frame(name="query1_gt_max")

    query1_lt_max = grouped.apply(
        lambda x: sum(x["query1_approval"] < x["max_approval"])
    ).to_frame(name="query1_lt_max")

    query1_eq_max = grouped.apply(
        lambda x: sum(x["query1_approval"] == x["max_approval"])
    ).to_frame(name="query1_eq_max")

    aggregated_data = pd.concat([query1_gt_max, query1_lt_max, query1_eq_max], axis=1)

    # Normalize data
    max_value = aggregated_data.sum(axis=1).max()
    relevant_data_normalized = aggregated_data.div(max_value, axis=0)

    # Plotting
    plt.figure(figsize=(10, 4))
    sns.set_style("whitegrid")
    base_color = "#3753A5"
    colors = [
        sns.light_palette(base_color, 15)[-1],
        sns.light_palette(base_color, 15)[-8],
        "#EBECF5",
    ]
    ax = plt.gca()
    set_font_properties(ax)

    # Stacked bar chart
    bars1 = sns.barplot(
        x=relevant_data_normalized.index,
        y=relevant_data_normalized["query1_gt_max"],
        color=colors[0],
        label="Outperforms",
    )

    bars2 = sns.barplot(
        x=relevant_data_normalized.index,
        y=relevant_data_normalized["query1_eq_max"],
        bottom=relevant_data_normalized["query1_gt_max"],
        color=colors[1],
        label="Matches",
    )

    bars3 = sns.barplot(
        x=relevant_data_normalized.index,
        y=relevant_data_normalized["query1_lt_max"],
        bottom=relevant_data_normalized["query1_gt_max"]
        + relevant_data_normalized["query1_eq_max"],
        color=colors[2],
        label="Underperforms",
    )

    plt.xlabel("Query size $|S|$", fontsize=20)
    plt.ylabel("Proportion", fontsize=20)

    # Adjusting x-axis and y-axis ticks for visibility
    plt.xticks(fontsize=20)
    plt.yticks(fontsize=20)

    # Display or save
    if save:
        dataset = detect_dataset(file_path)

        plt.tight_layout()
        plt.savefig(f"barcharts/{dataset}.pdf", format="pdf", dpi=300)
        plt.close()

        # Save the horizontal legend to a separate file without white spaces
        fig_leg = plt.figure(figsize=(4, 0.3))
        ax_leg = fig_leg.add_subplot(111)
        ax_leg.legend(
            *bars3.get_legend_handles_labels(), loc="center", mode="expand", ncol=3
        )
        ax_leg.axis("off")
        set_font_properties(ax_leg)
        plt.subplots_adjust(left=0, right=1, top=0.7, bottom=0.3)  # Adjust padding
        fig_leg.savefig(f"barcharts/{dataset}_legend.pdf", format="pdf", dpi=300)
        plt.close(fig_leg)

    else:
        plt.legend(loc="upper right")
        plt.tight_layout()
        plt.show()


if __name__ == "__main__":
    try:
        name = "final"

        BASE_PATH = get_base_dir_path() / "experiments/generate_wo_ex_unsupervised"
        EXPERIMENT_FOLDERS = [
            BASE_PATH / folder for folder in os.listdir(BASE_PATH) if name in folder
        ]

        file_paths = []
        for folder in EXPERIMENT_FOLDERS:
            file_path = str(BASE_PATH / folder / "results.csv")
            file_paths.append(file_path)
            plot_figure_one(file_path, save=True)

    except:
        extype, value, tb = sys.exc_info()
        traceback.print_exc()
        ipdb.post_mortem(tb)
