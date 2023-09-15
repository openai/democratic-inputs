import { UserInput } from "@/flows/types";
import { ChangeEvent, FormEvent, useCallback, useState } from "react";
import { Trans } from "@lingui/macro";
import { useLingui } from '@lingui/react';

export interface InputWithSubmitButtonProps{
    onInput: (input: UserInput) => void;
}

export default function InputWithSubmitButton({ onInput }: InputWithSubmitButtonProps){
    const [input, setInput] = useState('');
    const { _ } = useLingui();

    // Handle form submission
    const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
        // Prevent the form from actually being submitted
        e.preventDefault();

        // Pass the input out through the component
        const userInput: UserInput = { content: input };
        onInput(userInput);

        // Reset the input state
        setInput('');
    }, [input, onInput]);
    
    // Handle a change event for the input
    const handleInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    }, []);

    return(
        <form method="post" onSubmit={handleSubmit}>
            <input 
                name="input-field" 
                placeholder={_(`Tap to type`)}
                value={input}
                onChange={handleInput}
            />
            <button type="submit">
                <Trans>Submit</Trans>
            </button>
        </form>
    );
}