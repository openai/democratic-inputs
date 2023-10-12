from random import randint

from bleach import clean
from flask import Flask, send_from_directory
from flask import request, make_response, jsonify, redirect

from app.question import ReadingQuestion, LongTextQuestion, ChoiceQuestion, LongTextChoiceQuestion, Answer, InvalidAnswerException

app = Flask(__name__)
app.config.from_prefixed_env()

with app.app_context():
    from app.experiments.basic import BasicExperiment
    from app.experiments.experiment import InvalidRequestException
    from app.experiments.questiontype_demo import QuestionTypeDemoExperiment, chatbot_text
    from app.experiments.google_form_experiment import create_google_form_experiment
    from app.experiments.chatbot_personalization_delta_23_09_24 import create_chatbot_personalization_delta_23_09_24
    from app.experiments.chatbot_personalization_rating_23_09_25 import create_chatbot_personalization_rating_23_09_25
    from app.experiments.chatbot_personalization_rating_23_09_27 import create_chatbot_personalization_rating_23_09_27
    from app.experiments.chatbot_personalization_eval_23_09_28 import create_chatbot_personalization_eval_23_09_28
    from app.experiments.chatbot_personalization_eval_23_09_28_v2 import create_chatbot_personalization_eval_23_09_28_v2
    from app.experiments.chatbot_personalization_eval_23_09_28_strict import create_chatbot_personalization_eval_23_09_28_strict    

    
    


@app.get("/")
def index():
    if not ("user_id" in request.args and "experiment" in request.args):
        return make_response("Arguments 'user_id' and 'experiment' are required.", 400)
    return send_from_directory("static", "index.html")


@app.get("/demo")
def demo():
    random_user_id = "demo" + str(randint(0, 1000000))
    return redirect(f"/?user_id={random_user_id}&experiment=demo")


@app.get("/next_question")
def next_question():
    user_id = request.args["user_id"]
    experiment = request.args["experiment"]
    if experiment not in experiments_dict:
        return make_response("Invalid experiment", 404)

    next_question_response = experiments_dict[experiment].next_question(user_id)
    if next_question_response is None:
        return jsonify(["DONE", experiments_dict[experiment].completion_url])
    return jsonify(next_question_response.transmission_form())


@app.post("/submit_answer")
def submit_answer():
    user_id = request.form["user_id"]
    experiment = request.form["experiment"]
    if experiment not in experiments_dict:
        return make_response("Invalid experiment", 404)

    step_str = request.form["step"]
    try:
        step = int(step_str)
    except ValueError:
        return make_response("Argument 'step' not an integer", 400)

    answer_text = request.form.get("answer")
    answer = Answer(choice=request.form.get("choice"), text=answer_text if answer_text != "" else None)

    try:
        experiments_dict[experiment].submit_answer(user_id, answer, step)
    except InvalidAnswerException as e:
        return jsonify(["INVALID_ANSWER", clean(e.message, tags={})])
    except InvalidRequestException as e:
        return make_response(clean(e.message, tags={}), 400)
    return jsonify(["OK"])


# in this list, _experiments, you can register additional experiments.
google_form_experiment = create_google_form_experiment(
                            name='experiment0.5',
                            prolific_completion_code='C1LF2X1V')

chatbot_personalization_delta_23_09_24 = create_chatbot_personalization_delta_23_09_24(
                            name='chatbot_personalization_delta_23_09_24',
                            prolific_completion_code='C1LF2X1V')


chatbot_personalization_rating_23_09_25 = create_chatbot_personalization_rating_23_09_25(
                            name='chatbot_personalization_rating_23_09_25',
                            prolific_completion_code='C1LF2X1V')

chatbot_personalization_rating_23_09_27 = create_chatbot_personalization_rating_23_09_27(
                            name='chatbot_personalization_rating_23_09_27',
                            prolific_completion_code='C1LF2X1V')


chatbot_personalization_eval_23_09_28 = create_chatbot_personalization_eval_23_09_28(
                            name='chatbot_personalization_eval_23_09_28',
                            prolific_completion_code='C1LF2X1V')


chatbot_personalization_eval_23_09_2_v2 = create_chatbot_personalization_eval_23_09_28_v2(
                            name='chatbot_personalization_eval_23_09_28_v2',
                            prolific_completion_code='C1LF2X1V')

chatbot_personalization_eval_23_09_2_strict = create_chatbot_personalization_eval_23_09_28_strict(
                            name='chatbot_personalization_eval_23_09_28_strict',
                            prolific_completion_code='C1LF2X1V')

demo_experiment = create_chatbot_personalization_eval_23_09_28_strict(
                            name='demo',
                            prolific_completion_code='xxxx')

_experiments = [demo_experiment,
                chatbot_personalization_rating_23_09_27,
                chatbot_personalization_eval_23_09_28,
                chatbot_personalization_eval_23_09_2_v2,
                chatbot_personalization_eval_23_09_2_strict,
                chatbot_personalization_rating_23_09_25,
                chatbot_personalization_delta_23_09_24,
                google_form_experiment,
                BasicExperiment("demo2", "https://example.com/EXAMPLE_PROLIFIC_COMPLETION_URL",
                                [ReadingQuestion(1, chatbot_text, "Note this custom button!"),
                                 LongTextQuestion(2, "What do you think about <b>chatbots?</b>"),
                                 ChoiceQuestion(3, "From 0 to 7, how satisfied are you with this experiment?",
                                                ["0", "1", "2", "3", "4", "<i>5</i>", "6<script>alert('yo');</script>",
                                                 "7"]),
                                 LongTextChoiceQuestion(4, "The following statement was made by a fellow participant: "
                                                            "<blockquote>“And here, poor fool! with all my lore. I stand, no wiser than before.”</blockquote>"
                                                            "Do you agree or disagree with this statement? And why?",
                                                        ["Agree", "Disagree"])]),
                BasicExperiment("basic", "https://example.com/EXAMPLE_PROLIFIC_COMPLETION_URL",
                                [ReadingQuestion(1, "This experiment is now deactivated. Try ‘demo2’ instead!", ":)")])]

# Do not change this. Creates dictionary for dispatching calls to the right experiment.
experiments_dict = {}
for _exp in _experiments:
    assert _exp.name not in experiments_dict
    experiments_dict[_exp.name] = _exp
