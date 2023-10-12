from generative_social_choice.datasets.datasets import get_dataset
from generative_social_choice.objects.agents import CommentAgent
from generative_social_choice.objects.moderators import (
    Query1Moderator,
    Query1PrimeModerator,
)
from generative_social_choice.objects.committee import (
    generate_jr_slate,
    generate_ejr_slate,
)

import sys, traceback, ipdb


def run():
    df = get_dataset("google_forms_pilot").load()

    agents = [
        CommentAgent(
            id=id, prompt_type="agree_disagree_best_guess_less_agree", comment=opinion
        )
        for id, opinion in enumerate(
            df.drop(0)["Opinion"]
        )  # Row 0 is just the full question
    ]

    moderator = Query1Moderator(id=0, prompt_type="basic_explain_common_ground")
    query1_prime_moderator = Query1PrimeModerator(
        id=0, prompt_type="basic_explain_common_ground"
    )

    jr_slate = generate_jr_slate(
        agents=agents,
        moderator=moderator,
        k=4,
        experiment_type="pilot",
        log_dir_name="experiments/google_forms_pilot/",
    )

    ejr_slate = generate_ejr_slate(
        agents=agents,
        query1_moderator=moderator,
        query1_prime_moderator=query1_prime_moderator,
        k=4,
        experiment_type="pilot",
        log_dir_name="experiments/google_forms_pilot/",
    )

    print(jr_slate)
    print(ejr_slate)


if __name__ == "__main__":
    try:
        run()

    except:
        extype, value, tb = sys.exc_info()
        traceback.print_exc()
        ipdb.post_mortem(tb)
