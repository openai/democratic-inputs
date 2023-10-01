import { ONE_SECOND_MS } from "../config/constants";
import { sendBotMessage, sendParticipantMessage } from "../utilities/messages";
import { supabaseClient } from "../lib/supabase";

const defaultBotMessageDelay = ONE_SECOND_MS * 2.2;
const roomId = 'ee440eef-3cbd-48fd-ab37-a0ea12a7c895';
const leiId = '0db3232c-55b1-4826-9110-20cad6c031cd';
const bramId = '028d6b02-c13a-4ed3-b252-65046bf13b41';
const pepijnId = 'a2bb1cfb-2f12-49e6-ab9d-70ad8eee12f8';

export default async function screencast() {
    await sendBotMessage({
        roomId,
        content: `
            Hello everyone 👋
            I'm the moderator for today's conversation.
            Before we get started, let's take a brief moment for everyone to introduce themselves.
            May I suggest a quick 20-second intro from each participant?
        `,
    });
    await waitFor(ONE_SECOND_MS * 2);
    await sendParticipantMessage({
        roomId,
        participantId: leiId,
        content: `
           Hi, my name is Lei!
        `,
    });
    await waitFor(ONE_SECOND_MS * 2);
    await sendParticipantMessage({
        roomId,
        participantId: pepijnId,
        content: `
           I'm Pepijn. Nice to be here.
        `,
    });
    await waitFor(ONE_SECOND_MS * 2);
    await sendParticipantMessage({
        roomId,
        participantId: bramId,
        content: `
           Hello, bram here!
        `,
    });
    await waitFor(defaultBotMessageDelay);
    await sendBotMessage({
        roomId,
        content: `
            Today we're going to talk about **whenever a language model gives medical advice, a copy of the advice should be sent to your general practitioner.**
        `,
    });

    await waitFor(defaultBotMessageDelay);
    await sendParticipantMessage({
        roomId,
        participantId: bramId,
        content: `
        On one hand, it could add a layer of safety, but on the other hand, it might flood doctors with info.
        `,
    });

    await waitFor(defaultBotMessageDelay);
    await sendParticipantMessage({
        roomId,
        participantId: pepijnId,
        content: `
        Bram's right; it's a double-edged sword. Implementation could be tricky too. How do we decide what advice triggers the notification?
        `,
    });

    await waitFor(defaultBotMessageDelay);
    await sendParticipantMessage({
        roomId,
        participantId: leiId,
        content: `
        Good point, Pepijn. We should define when it's necessary. AI can't replace professional advice for everything.
        `,
    });

    await waitFor(defaultBotMessageDelay);
    await sendParticipantMessage({
        roomId,
        participantId: bramId,
        content: `
        Yeah, accuracy matters. It might over-notify for minor issues.
        `,
    });

    await waitFor(defaultBotMessageDelay);
    await sendParticipantMessage({
        roomId,
        participantId: pepijnId,
        content: `
        Privacy is another big concern. Do we want AI sharing our health data without consent?
        `,
    });

    await waitFor(defaultBotMessageDelay);
    await sendParticipantMessage({
        roomId,
        participantId: leiId,
        content: `
        Privacy is vital. Users should have control over their data.
        `,
    });

    await waitFor(defaultBotMessageDelay);
    await sendParticipantMessage({
        roomId,
        participantId: bramId,
        content: `
        So, it's a balance between safety and not overburdening doctors?
        `,
    });

    await waitFor(defaultBotMessageDelay);
    await sendParticipantMessage({
        roomId,
        participantId: pepijnId,
        content: `
        Exactly. Plus, we need user consent for data sharing.
        `,
    });

    await waitFor(defaultBotMessageDelay);
    await sendParticipantMessage({
        roomId,
        participantId: leiId,
        content: `
        What if we lean towards educating users? AI encourages consulting a doctor for serious issues but doesn't notify them for everything?
        `,
    });

    await waitFor(defaultBotMessageDelay);
    await sendParticipantMessage({
        roomId,
        participantId: bramId,
        content: `
        I like that idea. It promotes responsible AI use.
        `,
    });

    const { data: outcomeData } = await supabaseClient
        .from("outcomes")
        .insert({
            content: 'What do you think about: **Medical advice should not be documented because of privacy concerns and overburdening the GP.**',
            type: 'consensus',
            room_id: roomId,
        })
        .select();
}

async function waitFor(timeoutMs: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeoutMs);
    });
}
