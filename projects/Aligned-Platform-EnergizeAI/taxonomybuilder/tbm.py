
import json
import openai
import requests
import random

with open('keys.txt', 'r') as f:
    openai.api_key = f.readline()

def extract_nodes(data, hierarchical = False):
    '''
    Get taxonomy data from json file.

    Returns:
    labels: A labeled list of all prompts in the dataset
    ref_labels: a dictionary mapping labels to sample prompts
    definition: a dictionary mapping labels to categories
    taxonomy: a dictionary showing the directed taxonomy tree graph
    '''
    if data is None:
        return []
    labels = []
    ref_labels = {}
    definitions = {}
    taxonomy = {}
    for elem in data:
        taxonomy[elem['title']] = []
        defs = [elem['description']]
        if 'children' in elem:
            children_prompts, children_refs, children_definitions, children_tax = extract_nodes(elem['children'])

            for prompt, classif in children_prompts:
                labels.append((prompt, classif))
            
            for category in children_definitions:
                definitions[category] = children_definitions[category]
                if category in children_refs:
                    ref_labels[category] = children_refs[category]
                if hierarchical:
                    defs.append(children_definitions[category])

            del children_tax['root']
            for node in children_tax:
                taxonomy[node] = children_tax[node]
            taxonomy[elem['title']] = [x for x in children_tax]
        
        prompt_list = elem['prompts']
        if 'examplePrompt' in elem:
            ref_labels[elem['title']] = elem['examplePrompt']
        else:
            idx = random.choice([x for x in range(len(prompt_list))])
            ref_labels[elem['title']] = prompt_list[idx]
            prompt_list = prompt_list[:idx] + prompt_list[idx+1:]

        for prompt in prompt_list:
            labels.append((prompt, elem['title']))
        definitions[elem['title']] = ' OR '.join(defs)
    
    taxonomy['root'] = [elem['title'] for elem in data]
    return labels, ref_labels, definitions, taxonomy

def generate_classification_prompt(categories, descriptions, ref_labels, prompt, few_shot = False):
    '''
    Create the prompt string to pass to GPT.

    Params:
    categories: list of possible classifications
    descriptions: dictionary mapping labels to descritpions
    ref_labels: dictionary mapping labels to example prompt
    prompt: the new prompt to classify
    few_shot: if True, uses ref_labels; if False, does not use ref_labels.

    Returns:
    classif_prompt: the entire prompt string to the GPT model.
    '''
    defns_formatted = []

    for title in categories:
        desc = descriptions[title]
        defns_formatted.append(f'{title}: {desc}')
    
    defns_formatted = '\n'.join(defns_formatted)

    few_shot_examples = ''

    if few_shot:
        for title in categories:
            few_shot_examples += f'Text: {ref_labels[title]}\n'
            few_shot_examples += f'Class: {title}\n'

    categories = json.dumps(categories)

    classif_prompt =  f"""Classify the text into one of the classes. If none of the classes apply, reply 'General'.
    Classes: {categories}

    Class descriptions:
    {defns_formatted}
    {few_shot_examples}
    Text: {prompt}
    Class: """

    return classif_prompt

def execute_llm_request(prompt, model = 'gpt-4', verbose = False):
    '''
    Sends prompt to ChatGPT and processes results.

    Params:
    prompt: the prompt to evaluate
    model: ChatGPT model
    verbose: if True, prints ChatGPT response. If False, does not print response.

    Returns:
    res: ChatGPT response string.
    '''
    messages = [{"role": "user", "content": prompt}]
    if verbose:
        print('EXECUTING LLM REQUEST')
        print(prompt)
    response = openai.ChatCompletion.create(
        model=model,
        messages=messages,
        temperature=0,
        max_tokens=20,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0,
    )
    if verbose:
        print(response["choices"][0]["message"]["content"])

    res = response["choices"][0]["message"]["content"].replace('\'', '').replace('\"', '')
    return res

def get_results_leaves(prompts, defns, verbose = False):
    '''
    Given a list of prompt-category labelled pairs and definitions, runs the zero-shot training loop.
    Ignores structure of the taxonomy, treats each category as a separate class.
    Deprecated.

    Params:
    prompts: list of labelled pairs
    defns: definitions of categories
    verbose: if True, print ChatGPT outputs; if False, don't print.

    Returns:
    results: A list of all incorrectly classified prompts.
    '''
    results = []

    # generate categories
    categories = list(set([x[1] for x in prompts]))

    for prompt, classification in prompts:
        # always treat the leaf node as the classification, ignore structure
        content = generate_classification_prompt(
            categories, 
            defns, 
            prompt
        )
        resp = execute_llm_request(content, verbose = verbose)

        results.append(
            {
                'prompt': prompt,
                'expected': classification,
                'llm': resp
            }
        )
    return results

def get_results_hierarchical(prompts, ref_labels, defns, taxonomy, verbose = False, few_shot = False):
    '''
    Given a list of prompt-category labelled pairs, definitions, and a taxonomy, runs the zero-shot training loop.
    Each classification task traverses one level deeper into the tree.

    Params:
    prompts: list of labelled pairs
    defns: definitions of categories
    taxonomy: structure of the taxonomy as a graph.
    verbose: if True, print ChatGPT outputs; if False, don't print.
    few_shot: if True, use held-out reference prompts. If False, don't.

    Returns:
    results: A list of all incorrectly classified prompts.
    '''
    results = []
    parent = 'General'

    for prompt, classification in prompts:

        categories = [x for x in taxonomy['root']]

        content = generate_classification_prompt(
            categories, 
            {x: defns[x] for x in defns if x in categories}, 
            ref_labels,
            prompt,
            few_shot = few_shot
            )
        resp = execute_llm_request(content, verbose = verbose)

        if resp != 'General':
            parent = resp

        while resp in taxonomy and len(taxonomy[resp]) > 0:
            categories = taxonomy[resp]

            content = generate_classification_prompt(
                categories, 
                {x: defns[x] for x in defns if x in categories}, 
                ref_labels,
                prompt,
                few_shot = few_shot
            )
            resp = execute_llm_request(content, verbose = verbose)
            if resp != 'General':
                parent = resp


        results.append(
            {
                'prompt': prompt,
                'expected': classification,
                'llm': resp if resp != 'General' else parent
            }
        )
    return results

# train_data is a list of dictionaries
def evaluate_taxonomy(train_data, hierarchical = True, verbose = False, few_shot = False):
    '''
    Runs the classification loop.

    Params:
    train_data: json containing all prompts and taxonomy.
    hierarchical: If True, runs using taxonomy. If False, treats all categories equally. For now, always set to True
    verbose: If True, prints out all ChatGPT outpus. If False, only prints incorrect prompts.
    few_shot: If True, uses held-out examples for few-shot prompting. If False, runs zero-shot.

    Returns:
    acc: Accuracy on the given dataset.
    results: List of incorrect predictions.
    '''
    # generate training dataset
    prompts, ref_labels, defns, taxonomy = extract_nodes(train_data, hierarchical)

    results = get_results_hierarchical(prompts, ref_labels, defns, taxonomy, verbose = verbose, few_shot = few_shot) if hierarchical \
                    else get_results_leaves(prompts, defns, verbose = verbose)

    print('INCORRECT OUTPUTS:')
    num_wrong = 0
    for res in results:
        if res['expected'] != res['llm']:
            num_wrong += 1
            print('Prompt:', res['prompt'])
            print('Expected:', res['expected'])
            print('GPT output:', res['llm'])
    
    acc = 1 - num_wrong/len(results)
    print('Accuracy:', acc)

    return acc, results

def load_data():
    '''
    Gets data from Energize taxonomy.
    '''
    with open('apikey.txt', 'r') as f:
        key = f.readline()

    params = {
        "prompts": True,
    }
    # Define the API endpoint and headers
    url = "https://dev.api.energize.ai/api/openapi/taxonomy"
    headers = {
        "authorization": "Bearer " + key
    }
    # Make the request
    response = requests.get(url, headers=headers, params=params)
    data = response.json()
    return data

def zero_shot_loop():
    '''
    Runs the entire TBM zero-shot finetuning loop.
    '''
    data = load_data()

    acc, results = evaluate_taxonomy(data, verbose = False, few_shot = False)

    return acc, results

if __name__ == "__main__":
    # Main training loop, no example prompts
    acc, results = zero_shot_loop()