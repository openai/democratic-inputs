# objects folder 

This folder is where we store the code for the `Agent`s and `Moderator`s. We make all our GPT calls through this interface. Here is a brief guide on how to use this interface. 

## General information about how the code works 

The abstract base classes `Agent` and `Moderator` are in `abstract_agents.py`. Here you can also find the implementation of the GPT caller `GPTCaller` and the parser `GPTOutputParser`. 

The subclasses are what we actually use for experiemnts. They store their own prompts, and if you have a subclass like `CommentAgent` you can call `.get_approval()` and `.get_description()`. For `Moderator` subclasses like `Query1Moderator`, you can call `.query1()` or `.query1_prime()`. See implementation for details.

**For an interactive demo** of how to use `Agent`, `Moderator`, the subclasses and compute JR/EJR slates, see `demo_agents_and_slate_generation.ipynb`.

See below for some notes on how to implement your own additional `Agent`s and `Moderator`s. The main advice is just to follow the structure of the other agents. See below for a template.

## Agents 

Here is a general template for creating your own agent:

```python
class MyAgent(Agent): # inherit from Agent, which takes care of GPT calls
    """
    Your sample agent.
    """

    prompt_template = {
        "short_name_for_prompt" : YOUR_PROMPT_TEMPLATE,
        "short_name_for_another_prompt" : YOUR_SECOND_PROMPT_TEMPLATE,
    }

    prompt_type_parse_key = {"short_name_for_prompt" : <name of key in dict which contains "real answer" you want to parse out>,
                            # if prompt name doesn't need parsing, just leave this blank}
    # Note: the backend parser has options for parsing besides dict parsing (where you tell GPT to output a dict and care about a specific key), but for now the only parsing option is dict parsing. Feel free to implement others

    def __init__(self, *, id, prompt_type, model=DEFAULT_MODEL, **kwargs):

        # Step 1: save any kwargs 
        comment = kwargs["comment"]

        # Step 2: create prompt template from kwargs 
        self.prompt_template = self.__class__.prompt_templates[prompt_type].format_map(
            SafeDict(self_comment=self.comment)
        )

        # Step 3: run __init__() of Agent()
        # VERY IMPORTANT: first you have to define self.prompt_template, and format it, before you run __init__()  of Agent().
        super().__init__(id=id, prompt_type=prompt_type, model=model)

    # Note: get_approval() is implemented for you, by the base class Agent.

    # You will also need to implement get_description on your own. This is used by Query1. 
    def get_description(self):
        return self.comment 
```

Agent code can get more complicated if you need to do data processing to construct the prompts. See `agents.py` for more examples (look particularly at `VoteCommentsAgent` or `CMVAgent`.)

## Moderators 

They work very similarly to the agents, except they take as input a list of agents. If you want to write a new moderator, understand the above agent blueprint, and then go to `moderators.py` and follow that general template. 