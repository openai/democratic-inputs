def get_query2_prompt_types():
    return {
        "agree_disagree_best_guess",
        "agree_disagree_best_guess_less_agree",
        "agree_disagree_best_guess_explain",
        "cmv_basic",
        "agree",
        "agree_unknown_disagree",
        "agree_unknown_disagree_explain",
    }


def query2_output_implies_agreement(query2_output, query2_prompt_type):
    if query2_prompt_type in [
        "agree_unknown_disagree",
        "agree_disagree_best_guess",
        "agree_disagree_best_guess_less_agree",
    ]:
        return query2_output.lower() == "agree"
    elif query2_prompt_type == "agree":
        return query2_output.lower() == "yes"
    elif query2_prompt_type == "cmv_basic":
        return query2_output.lower() == "yes"
    elif query2_prompt_type == "basic":
        return query2_output.lower() == "yes"
    else:
        raise ValueError(f"Unsupported query2_prompt_type {query2_prompt_type}")
