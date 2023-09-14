

import { Helpers } from "graphile-worker";
import supabaseClient from "../lib/supabase";
import openaiClient, { createVerificationFunctionCompletion } from "../lib/openai";
import { CreateChatCompletionRequestMessage } from "openai/resources/chat";
import { Database } from "../generated/database.types";

type Message = Database["public"]["Tables"]["messages"]["Row"]

// TODO: integrate room ID to collect the right messages
export default async function equalParticipation() {
    const verificationResult = await createVerificationFunctionCompletion({
        taskInstruction: `Is the conversation mentioned below a balanced conversation where everyone has said a similar amount of said what they think?`,
        taskContent: `
            Topic: The Influence of Social Media on Teenagers

            Participant 1: Alice
            Participant 2: Bob
            Participant 3: Carol

            Alice: Greetings guys. We've been quiet about the prominence of social media in teenagers' lives lately. Any consequences you link to it?

            Bob: I've noticed that teens are increasingly comparing their lives with the idealized lives of others on social media, leading to feelings of inadequacy and decreased self-esteem.

            Carol: That's sadly true, Bob. I've also seen that online harassment is getting rampant. Bullying has taken a digital form, leaving teenagers anxious and depressed.

            Alice: Yes, cyberbullying and peer pressure are considerable issues. It's also concerning how much private information teenagers put online, vulnerable to misuse.

            Bob: This privacy issue is a big deal indeed. I also think that the blue light emitted by screens is causing physiological problems, like sleep disorders, which isn't good especially for growing teens.

            Carol: Beyond health issues, I believe it's interfering with real-life social skills. Teens being virtually connected all the time are less adept at face-to-face interactions.

            Alice: The focus on quantity (likes and followers) over factual quality is disappointing too. It seems to degrade the value of authentic relationships
        `,
    });

    console.log('Balanced discussion result:');
    console.log(verificationResult);
}

export async function equalize(
    lastRun: string | null,
    helpers: Helpers
) {
    // Retrieve all messages from supabase
    let statement = supabaseClient.from("messages").select().eq("type", "chat");

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
        return;
    }

    // Check whether participants have equally contributed (boolean)
    const equalContribution = await equalContributedCheck(messages.data);

    // GUARD: for false or null
    if (equalContribution) {
        return;
    }

    // TODO: calculate percentages of contribution and act accordingly.
    // We need participantIds to do so as they are used to determine their contribution.
    // const result = await equalContributionCheckPercentages(messages.data);
    // Insert it as a string
    // await supabase.from("messages").insert({
    //   type: "bot",
    //   content: result,
    // })
}

async function equalContributedCheck(messages: Message[]): Promise<boolean | null> {

    // Request GPT to equal the set of messages
    const completion = await openaiClient.chat.completions.create({
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content: `The following shows part of a transcript of a discussion between three participants.
        The transcript is written in the following JSON format { participantId: {id}, "content": {message}}.

        You are a moderator of the discussion, is everyone expressing their views equally?

        If yes say true if no say false.

        Reply in the following JSON object { result: {boolean, true if contribution is equal} }`
            },
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
    });

    const completionResult = completion.choices[0].message.content;

    if (!completionResult) {
        return null;
    }

    const checkResult = JSON.parse(completionResult).result;

    return checkResult;
}

//Can be used to check the percentages of equal contribution
async function equalContributionCheckPercentages(messages: Message[]) {
    const completion = await openaiClient.chat.completions.create({
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
