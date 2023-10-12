# Generative Social Choice: platform

This folder contains the *platform code* for how participants interact with our process. For our *research code* (implementing and measuring performance of algorithms and prompts), see the other folder. 

## Experiment descriptions 

In `app/experiments/` you can find the files specifying the experiments we have run on Prolific so far. We will update this as we run larger-scale experiments. 

## Running instructions
No installation is necessary, but you will have to have the Python packages `flask`, `bleach`, and `sqlalchemy` installed.
To run the platform locally on your machine, navigate into the project directory. Then, run
> export FLASK_MOCK_DB=true
> 
> python3 run.py

The first of the two lines prevents a connection to the database server, which is convenient for testing, but **should not be used on the server**!

To try it out the platform, open http://127.0.0.1:5000/?user_id=paul&experiment=demo2, where you might have to adapt the port depending on the output of the above command.
In case this link directs you to example.com, this is by design:
If the prolific user with your `user_id` has already answered all questions, they cannot respond to the same questions again and will ultimately be redirected to Prolific instead.


models.py: This file could contain all the SQLAlchemy models that represent your tables.
db_operations.py: This file would contain all the database operations like get_question, save_answer, etc.

## Accessing data

Please contact us if you're interested in accessing our data. 