# Generative Social Choice: research code 

This folder contains the *research code* for how participants interact with our process. For our *platform code* (the interface Prolific participants use), see the other folder. 

## Setup instructions 

1. In the folder where this `README.md` file is located, call 
```pip install -e .```
2. Create a file `OPENAI_API_KEY` in `utils/`, and write in it your (personal) API key. 

## Reproducing experiments from our OpenAI talk (Sept 29 2023)

Our preliminary experiment was structured as follows:
1. Survey 24 Prolific participants about their opinions regarding the personalization of AI. 
2. (code below) *Run our process* to condense the 24 participants' opinions into **6 representative statements**. 
3. Survey 24 new Prolific participants and match them to the statements optimally. 

![Visualization of pilot results](gen_soc_choice_pilot_results.png)

Run 
```
cd experiments/openai_jr_demo
python3 make_jr.py --algorithm_type BalancedJR --experiment_name chatbot_personalization_rating_23_09_27 --moderator_type polarize --query1_prompt_type fixed_cluster_size_more_explanation_cot --k 6
```

For the implementation of the `BalancedJR` algorithm, see `objects/committee.py`.

For the implementation of Query1 (this is the query which, given a set of agents and their opinions, returns a statement which represents as many people as possible), see `PolarizeModerator` in `objects/moderators.py`. 

Note: this code won't run without our dataset, which isn't pushed to this repo yet. Please reach out to us if you're interested in getting access to our Prolific survey data!

The logs from the run of the experiment we presented at OpenAI can be found in `2023-09-28-11:54:31__4app_level__chatbot_personalization_rating_23_09_27__polarize____JR__fixed_cluster_size_more_explanation_cot__6`.

## In-progress work 

The folders `prolific/`, `prolific_approval_query_eval/`, and `knn_eval/` contain some in-progress work. Please reach out if you'd like to learn more! 

## Reproducing experiments from our paper 

This section describes how to reproduce the experiments from our paper, [Generative Social Choice](https://arxiv.org/abs/2309.01291). These experiments focus on measuring the accuracy of the queries used to implement our process. Here we used datasets from Polis (`minimumwage`, `bowlinggreen`) and Reddit (selected comments from /r/`changemyview`). 

### Evaluating approval queries 

#### Vote prediction accuracy across datasets experiment

Step 1: run vote prediction on Polis data.

```
cd experiments/approval_query_eval/predict_polis_votes
python3 vote_prediction_from_votes_and_comments.py --dataset "minimumwage" --num-given-comments 1 --num-given-votes 2
python3 vote_prediction_from_votes_and_comments.py --dataset "bowlinggreen" --num-given-comments 1 --num-given-votes 2
python3 vote_prediction_from_votes_and_comments.py --dataset "bowlinggreen" --num-given-comments 3 --num-given-votes 20
```

Step 2: run vote prediction on `changemyview` data. 
```
cd experiments/approval_query_eval/predict_cmv_votes
python3 vote_prediction_cmv.py --seeds "[4]" --num-agents None --num-agent-repetitions 20
```

#### Vote prediction accuracy across seeds experiment

```
cd experiments/approval_query_eval/predict_cmv_votes
python3 vote_prediction_cmv.py --seeds "[0,1,2,3,4]" --num-agents None --num-agent-repetitions 20
```

#### Plotting the data

Run the iPython notebook in `plots/approval_query_eval/approval_query_plots.ipynb`.

### Evaluating generative queries: comparison with most-approved input statement 

To run this experiment: 
```
cd experiments/generate_wo_ex_unsupervised
python3 generate_wo_ex_unsupervised.py --dataset minimumwage --query-sizes "[3,5,7,9,11,13,15]" 
python3 generate_wo_ex_unsupervised.py --dataset changemyview --query-sizes "[3,5,7,9,11,13]" --seed 0
python3 generate_wo_ex_unsupervised.py --dataset bowlinggreen --query-sizes "[10,20,30,40]" 
```

To plot the data, run 
```
cd plots/generate_wo_ex_unsupervised
python3 generate_wo_ex_unsupervised_barcharts.py
python3 generate_wo_ex_unsupervised_histograms.py
```

### Evaluating generative queries: synthetic dataset 

To run this experiment and plot the data:
```
cd experiments/generate_wo_ex_synthetic/
python3 synthetic.py 10 5 5
python3 synthetic.py 10 10 5
python3 synthetic.py 10 20 5
python3 synthetic.py 10 40 5
```
In contrast to other scripts, plots get generated in subdirectories of `experiments/generate_wo_ex_synthetic/`.

### Evaluating generative queries with exclusion 

To run this experiment:
```
cd experiments/generate_with_ex_eval
python3 generate_with_ex_eval.py --dataset minimumwage --max_depth 10 --num_repetitions 10
python3 generate_with_ex_eval.py --dataset changemyview --max_depth 10 --num_repetitions 10
python3 generate_with_ex_eval.py --dataset bowlinggreen --max_depth 10 --num_repetitions 10
```

To plot the data, run the iPython notebook `plots/generate_with_ex_eval/generate_with_ex_eval_plots.ipynb`.

### Evaluating Process 1 and Process 2

#### Evaluating Process 1 (JR)

To run this experiment, run the following: 

```
cd experiments/jr_and_ejr_eval
python3 jr_and_ejr_eval.py --experiment_type changemyview --algorithm_type JR --seed 0 --k 5 --query1_prompt_type cmv_basic_no_fewshot_yes_cot --log_dir_name experiments/jr_and_ejr_eval/ --num_repetitions 9
```
Arguments:

- `experiment_type`: Type of experiment to run. Defaults to changemyview. Choices are ['minimumwage', 'bowlinggreen', 'changemyview'].
- `algorithm_type`: Algorithm type for the experiment (JR or EJR).
- `seed`: Random seed for reproducibility. Defaults to 0.
- `k`: Number of committee members to select. Defaults to 5.
- `query1_prompt_type`: Query1 prompt type. Defaults to cmv_basic_no_fewshot_yes_cot.
- `log_dir_name`: Directory to store logs. Defaults to experiments/jr_and_ejr_eval/.
- `num_repetitions`: Number of repetitions for the experiment. Defaults to 9.

#### Evaluating Process 2 (EJR)

To run this experiment, run the following: 
```
cd experiments/jr_and_ejr_eval
python3 jr_and_ejr_eval.py --experiment_type changemyview --algorithm_type EJR --seed 0 --k 5 --query1_prompt_type cmv_basic_no_fewshot_yes_cot --log_dir_name experiments/jr_and_ejr_eval/ --num_repetitions 9
```

Arguments:

- `experiment_type`: Type of experiment to run. Defaults to changemyview. Choices are ['minimumwage', 'bowlinggreen', 'changemyview'].
- `algorithm_type`: Algorithm type for the experiment (JR or EJR).
- `seed`: Random seed for reproducibility. Defaults to 0.
- `k`: Number of committee members to select. Defaults to 5.
- `query1_prompt_type`: Query1 prompt type. Defaults to cmv_basic_no_fewshot_yes_cot.
- `log_dir_name`: Directory to store logs. Defaults to experiments/jr_and_ejr_eval/.
- `num_repetitions`: Number of repetitions for the experiment. Defaults to 9.

#### Generating data for LLM 1-shot benchmark (used in JR analysis) 

```
cd experiments/llm_1shot
python3 compute_llm_1shot.py --dataset-name minimumwage --seed 0 --k 5 --prompt-type output_anything --log-dir-name experiments/llm_1shot/ --num-repetitions 20
```

Arguments:
- `dataset-name`: Name of the dataset. Defaults to minimumwage.
- `seed`: Seed for reproducibility. Defaults to 0.
- `k`: Value of k. Defaults to 5.
- `query1-prompt-type`: Type of prompt for Query1. Defaults to output_anything.
- `log-dir-name`: Directory to log results. Defaults to experiments/llm_1shot/.
- `num-repetitions`: Number of experiment repetitions. Defaults to 20.

To create baseline plots (comparison of Process 1 with baseline methods), run the iPython notebook `plots/jr_and_ejr_eval/baseline_plots/generate_JR_and_EJR_comparison_to_baseline_plots.ipynb`.

To create grid representations of slates, run the iPython notebook `generate_single_boxes_plot.ipynb` or look for existing files in `plots/boxes_plots/ApprovalMatrix`. 
