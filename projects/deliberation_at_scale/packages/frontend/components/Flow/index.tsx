import { useCallback, useEffect, useState } from "react";
import { Flow as FlowType, FlowStepBase, OnInput, TimeOut, Message, UserInput } from "../../flows/types";
import sleep from "@/utilities/sleep";
import UserInputForm from "../InputWithSubmitButton";

//made it an interface, so we can more easily expand it later
interface FlowProps{
    flow: FlowType;
}

export default function Flow({ flow }: FlowProps){
    const [positionIndex, setPositionIndex] = useState(0);
    const [flowMessages, setFlowMessages] = useState<Message[]>([]);

    /** This will advance to the next subflow */
    const goToNext = useCallback(() =>{
        setPositionIndex((pos) => pos + 1);
    }, []);

    /** This will advance to a subflow of choice */
    const goToName = useCallback((name: string) => {
        // Retrieve the index for the given name
        const index = flow.steps.findIndex(function(step){
            return step.name === name;
        });

        // GUARD: check that the index is not -1, indicating that the subflow
        // was not found
        if (index) {
            setPositionIndex(index);
        } else {
            // OPTIONAL: throw error for that sweet sweet developer experience
        }
    }, [flow.steps]);

    /** This will add a message to the log */
    const postMessage = useCallback((message: Message | Message[]) => {
        // Optionally wrap the input argument in an array
        const messagesArr = Array.isArray(message) ? message : [message];

        // Append the messages to the array
        setFlowMessages((m) => m.concat(messagesArr));
    }, []);

    useEffect(()=>{
        // GUARD: Check that the position is not out of bounds
        if(positionIndex > flow.steps.length -1) return;    

        //we implement an AbortController to prevent acting on timeout if user input resolves it 
        const controller = new AbortController();
        const signal = controller.signal;

        async function timeoutHandler(){
            // Retrieve the step
            const step = flow.steps[positionIndex];

            // GUARD: Check if a timeout has been set in the flow config
            if ('timeout' in step){
                // Await the timeout
                await sleep((step as FlowStepBase & TimeOut).timeout);

                // GUARD: double-check that the signal hasn't been aborted yet
                if(!signal.aborted){
                    // If sleep is over and we haven't beena borted, go to the
                    // next subflow.
                    goToNext();
                }
            }
        }

        async function skipHandler() {
            let skipResult = flow.steps[positionIndex].skip?.({
                goToNext: goToNext,
                goToName: goToName,
                postMessage: postMessage
            });
            if (skipResult instanceof Promise) {
                // TODO: disable input
                skipResult = await skipResult;
                // TODO: enable input
            }
            return skipResult;
        }

        async function handler(){
            // GUARD: Check if we need to skip this subflow
            if(await skipHandler()){
                // If so, go to next and short-circuit the function
                goToNext();
                return;
            }

            // If not, add the messages and potentially await a timeout
            postMessage(flow.steps[positionIndex].messages);
            await timeoutHandler();
        }

        //call a sync function
        handler();

        //clean up on unmount
        return () => {
            // Whenever we progress in the flow before all timeouts can occur,
            // we throw an abort signal so we don't trigger any resolving promises.
            controller.abort(); //abort timer functionality
        };
    }, [positionIndex, flow.steps, goToName, goToNext, postMessage]);

    /** Handler for any user input */
    const handleInput = useCallback((input: UserInput)=>{
        // GUARD: Check that we're not out of bounds for the position
        if(positionIndex > flow.steps.length -1) return;    

        // Retrieve the step
        const step = flow.steps[positionIndex];

        // GUARD: Check that the subflow handles user input
        if('onInput' in step) {
            // Run the onInput function
            (step as FlowStepBase & OnInput).onInput(
                input,
                {
                    goToNext: goToNext,
                    goToName: goToName,
                    postMessage: postMessage
                }
            );
        }
    },[flow.steps, goToName, goToNext, positionIndex, postMessage]);

    return(
        <>
            <div>
                {flowMessages.map((message, i)=> <p key={i}>{message}</p>)}
            </div>
            <div>
                <UserInputForm onInput={handleInput}/>
            </div>
        </>
    );
}

