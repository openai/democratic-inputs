import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches


def generate_matrix(k, n):
    return np.random.randint(2, size=(k, n))


def order_agents(matrix):
    order = np.argsort(-matrix.sum(axis=0))
    return matrix[:, order]


def get_optimal_fontsize(space_per_label):
    """Determine font size based on space available for each label."""
    if space_per_label > 40:
        return 14
    elif space_per_label > 20:
        return 10
    elif space_per_label > 10:
        return 8
    else:
        return 6


def visualize_approval_matrix(
    matrix,
    show_histograms=False,
    aspect_ratio=1,
    linewidths=7,
    save_as_vector=False,
    filename="approval_matrix",
):
    ordered_matrix = order_agents(matrix)
    my_figsize = (20, (10 * matrix.shape[0]) // 5)
    if show_histograms:
        fig, axes = plt.subplots(
            2,
            2,
            figsize=my_figsize,
            gridspec_kw={"width_ratios": [0.2, 1], "height_ratios": [1, 0.2]},
        )
        heatmap_ax, yhist_ax, xhist_ax, _ = (
            axes[0][1],
            axes[0][0],
            axes[1][1],
            axes[1][0],
        )
    else:
        fig, axes = plt.subplots(figsize=my_figsize)
        heatmap_ax = axes

    sns.heatmap(
        ordered_matrix,
        cmap=["#EBECF5", "#3753A5"],
        linewidths=linewidths,
        linecolor="white",
        cbar=False,
        ax=heatmap_ax,
    )

    heatmap_ax.tick_params(
        axis="both",
        which="major",
        labelsize=12,
        labelbottom=False,
        labeltop=True,
        width=0,
        length=0,
        pad=5,
    )

    # No x and y axis labels
    heatmap_ax.set_xlabel("")
    heatmap_ax.set_ylabel("")

    row_ticks = [f"Member {i+1}" for i in range(matrix.shape[0])]
    heatmap_ax.set_yticks(np.arange(matrix.shape[0]) + 0.5)
    heatmap_ax.set_yticklabels(row_ticks, rotation=0, va="center", fontsize=14)

    if matrix.shape[1] <= 20:
        col_ticks = [f"Agent {i+1}" for i in range(matrix.shape[1])]
    else:
        col_ticks = [str(i + 1) for i in range(matrix.shape[1])]
    heatmap_ax.set_xticks(np.arange(matrix.shape[1]) + 0.5)
    heatmap_ax.set_xticklabels(col_ticks, rotation=0, fontsize=14, ha="center")

    # Legend
    legend_elements = [
        mpatches.Patch(color="#3753A5", label="Approval"),
        mpatches.Patch(color="#EBECF5", label="Not Approval"),
    ]
    heatmap_ax.legend(
        handles=legend_elements,
        loc="lower center",
        bbox_to_anchor=(0.5, -0.3),
        ncol=2,
        fontsize=14,
    )

    heatmap_ax.set_aspect(aspect_ratio)

    if show_histograms:
        sns.barplot(
            y=np.sum(ordered_matrix, axis=1), x=row_ticks, ax=yhist_ax, color="#3753A5"
        )
        sns.barplot(
            x=np.sum(ordered_matrix, axis=0),
            y=col_ticks,
            ax=xhist_ax,
            color="#3753A5",
            orient="h",
        )

        # Hide the unused subplot
        axes[1][0].axis("off")

    plt.tight_layout()
    if show_histograms:
        plt.subplots_adjust(wspace=0.3, hspace=0.3)
    # Save the figure with increased DPI and optionally as a vector graphic
    if save_as_vector:
        plt.savefig(f"{filename}.svg", bbox_inches="tight")
    else:
        plt.savefig(f"{filename}.png", dpi=300, bbox_inches="tight")

    plt.show()
