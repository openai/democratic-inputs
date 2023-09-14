

import { Helpers, quickAddJob } from "graphile-worker";
import supabase from "../lib/supabase";
import openai from "../lib/openai";
import { ChatCompletionMessageParam, CreateChatCompletionRequestMessage } from "openai/resources/chat";
import { Database } from "../data/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"]

const TASK_INTERVAL_SECONDS = 10;

// check how to include participant ID
function checkEqualParticipation(participant_id : string, eq_contribution: boolean | null) {
    const equalParticipation = {
        "participant_id": participant_id,
        "eq_contribution": eq_contribution,
    };
    return JSON.stringify(equalParticipation);
}


export default async function equalize(
    lastRun: string | null,
    helpers: Helpers
) {
    // Retrieve all messages from supabase
    let statement = supabase.from("messages").select().eq("type", "chat")

    if (lastRun) {
        statement = statement.gt("created_at", lastRun);
    }

    const messages = await statement;

    // GUARD: Throw when we receive an error
    if (messages.error) {
        throw messages.error;
    }

    // GUARD: If there are no messages, reschedule the job
    if (messages.data.length === 0) {
        helpers.logger.info("No messages found.");
        return reschedule(lastRun);
    }

    // Check whether participants have equally contributed (boolean)
    const equalContribution = await equalContributedCheck();

    // GUARD: for false or null
    if (equalContribution) {
        return reschedule(lastRun);
    }

    // TODO: calculate percentages of contribution and act accordingly.
    // We need participantIds to do so as they are used to determine their contribution.
    // const result = await equalContributionCheckPercentages(messages.data);
    // Insert it as a string
    // await supabase.from("messages").insert({
    //   type: "bot",
    //   content: result,
    // })

    return reschedule(lastRun);
}

// hier gaat nog iets mis. Wat het is weet ik nog niet (Eva)
async function equalContributedCheck(): Promise<boolean | null> {

    // Request GPT to equal the set of messages
    const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content: 'The following shows part of a transcript of a discussion between three participants. You are a moderator of the discussion, is everyone expressing their views equally?'
            },
        ],
        functions: [
            {
                name:  "check_equal_participation",
                description: "Check whether there is an equal participation among participants",
                parameters: {
                    type: Object,
                    properties: {
                        participant_id: {
                            "type": "string"
                        },
                        eq_contribution: {
                            "type": "boolean"
                        }
                    },
                }
            },
        ],
        function_call : {
            name:  "check_equal_participation",
        },
    },
    );

    const responseMessage = completion.choices[0].message;
    // Step 2: check if GPT wanted to call a function

    if (!responseMessage) {
        return null;
    }

    console.log('Response message from Equal Participation: ', responseMessage);
    // if (responseMessage.function_call) {
    //     // Step 3: call the function
    //     // Note: the JSON response may not always be valid; be sure to handle errors
    //     const availableFunctions = {
    //         check_equal_participation: checkEqualParticipation,
    //     };  // only one function in this example, but you can have multiple
    //     const functionName = responseMessage.function_call.name;
    //     const functionToCall = availableFunctions[functionName];
    //     const functionArgs = JSON.parse(responseMessage.function_call.arguments);
    //     const functionResponse = functionToCall(
    //         functionArgs.participant_id,
    //         functionArgs.eq_contribution,
    //     );
    //     return functionResponse;
    // }

    return null;
}

//Can be used to check the percentages of equal contribution
async function equalContributionCheckPercentages(messages: Message[]) {
    const completion = await openai.chat.completions.create({
        temperature: 0,
        messages: [
            {
                role: 'system', content: `
        The following shows part of a transcript of a discussion between three participant.
        The transcript is written in the following JSON format { participantId: {id of participant}, content: {message}}.

        Please indicate in percentages how much each of the participants have expressed their view in the discussion in whole numbers in the following JSON Object:
        { contributions: { participantId: {participantId}, contribution: {percentage}}[] }`},
            ...messages.map(
                (message) =>
                    ({
                        role: "user",
                        content: JSON.stringify({
                            participantId: message.participant_id,
                            content: message.content
                        }),
                    } as CreateChatCompletionRequestMessage)
            ),
        ],
        model: 'gpt-4',
    });

    const completionResult = completion.choices[0].message.content;

    if (!completionResult) {
        return null;
    }

    const contributionResult = JSON.parse(completionResult);

    // return contributionResult;
}

/**
 * Reschedule this job for the next iteration
 */
function reschedule(initialDate: string | null) {
    // Re-schedule this job n seconds after the last invocation
    quickAddJob({}, "equalize", new Date(), {
        runAt: new Date(
            (initialDate ? new Date(initialDate) : new Date()).getTime() +
            1_000 * TASK_INTERVAL_SECONDS
        ),
        jobKey: "equalize",
        jobKeyMode: "preserve_run_at",
    });
}
