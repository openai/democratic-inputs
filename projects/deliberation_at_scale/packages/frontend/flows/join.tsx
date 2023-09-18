import { Flow } from "./types";

const joinFlow: Flow = {
    name: "join",
    steps: [
        {
            name: "join_introduction",
            messages: ["Oh hi there", "This is a placeholder"],
            timeout: 5000,
            skip: async () => {
                return false;
            },
        },
        {
            name: "ask_for_age",
            messages: ["How old are you?"],
            onInput: async (input, helpers) => {
                //regex to check if a string is just numbers
                if(/^\d+$/.test(input.content) ){
                    // helpers.goToNext?.();   //optional chaining of function
                    helpers.goToName?.('show_this_step');
                    helpers.postMessage?.( 'this is an age, ty <3');
                } 
                else{
                    helpers.postMessage?.('this is NOT an age, :(');
                }
            },
            skip: async () => {
                const age: number | undefined = undefined; // FIXME: get AGE
                if(age){
                    return true;
                }
                return false;
            }
        },
        {
            name: "skip_this_step",
            messages: ["this step should not be shown", "a succesful age answer should leap over this one using the goToName helper"],
            onInput: async (input, helpers) => {
                helpers.postMessage('echo:' + input.content);
            },
            skip: async () => {
                return false;
            }
        },
        {
            name: "show_this_step",
            messages: ["thank you for testing this flow. d(º . º d)"],
            onInput: async (input, helpers) => {
                helpers.postMessage('echo:' + input.content);
            },
            skip: async () => {
                return false;
            }
        }
    ]
};

export default joinFlow;