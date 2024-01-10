# Note
This is a snapshot version of our codebase. The actively maintained copy is hosted here
<https://github.com/Social-Futures-Lab/case-law-ai-policy>

# Case Law for AI Policy Codebase
**First steps for environment setup**: Before you start the codebase, you'll want to
set up the environment. Do the following:

- Create a file `.env` at the root of the project folder
- Inside it add a line `OPENAI_API_KEY = {your-openai-api-key}`

(TODO: Add more credentials here as needed.)

**Recommended Python config**: Some code will require python, while you can manage python
dependencies however you like, the recommended way is to install `miniconda` and then
create a conda environment specifically for this project `conda create --name openai-cl`.
If you're using miniconda, you'll probably also want to `conda install python pip`.

Then, for each Python based section (folders that have a `requirements.txt`), make sure to
run `pip install -r requirements.txt`. If you are using either conda or virtualenv, it
is OK to have a single environment for all bits of python in this project.

**Code editor advice**: To maintain code style consistency, if your editor supports
plugins, please install the `EditorConfig` plugin.

## Datasets
Data / Inputs are checked into `data/` as needed. Please take care to not check in huge files
but it is OK to version track essential files.

## Case Variant Generation
This component handles generating cases from a set of given cases and dimensions using
an LLM.

The code is located in `case-tools/`

## Case Perturbation Crowd Tool
This component includes an interactive tool using which a crowd or internet participant
can judge and perturb cases.

The code is located in `interactive-perturb/` and is split into `./frontend/` and `./backend/` parts.

This tool consists of 2 components:
- **Judgment component** (Inputs: case, response types):
    Given a case, participant judges (rates?) appropriateness of each response type
- **Perturbation component** (Inputs: case, dimensions):
    Given a case and seed dimensions, participant creates one or more perturbed cases.
    Perturbation can be done either by:
    - invoking LLMs to generate along preset dimensions + selecting / editing
    - invoking LLMs to generate along a new written dimension + selecting / editing
    - writing from scratch

### Starting Up the Tool
To start up the tool, we run the frontend and backends separately. To run the frontend, do:

```
cd interactive-perturb/frontend
python -m http.server 8008
```

To startup the backend, do:
```
cd interactive-perturb/backend
python server.py
```

### Tech Stack Documentation

