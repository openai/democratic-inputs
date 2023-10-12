from generative_social_choice.datasets.datasets import get_dataset
import re


polis_dataset = get_dataset("polis")


def parse_response(*, response, query2_prompt_type):
    # If parsing goes well, response will be AGREE or DISAGREE.
    # If it goes poorly, it might look like "" { DISAGREE} " or something
    # so to manually fix this, remove all non-alphanumeric characters
    response = re.sub("[^a-zA-Z]+", "", response)
    parsed_response = None
    if query2_prompt_type in [
        "agree_disagree_best_guess",
        "agree_disagree_best_guess_less_agree",
    ]:
        if response.lower() == "agree":
            parsed_response = 1
        elif response.lower() == "disagree":
            parsed_response = -1
        return parsed_response
    elif query2_prompt_type == "agree_disagree_best_guess_explain":
        if response.lower() == "agree":
            parsed_response = 1
        elif response.lower() == "disagree":
            parsed_response = -1
        return parsed_response
    else:
        raise NotImplementedError("Invalid query2_prompt_type")
