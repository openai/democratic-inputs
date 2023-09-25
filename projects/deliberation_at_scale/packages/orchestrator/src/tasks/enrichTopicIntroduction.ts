import { createModeratedEnrichPromptTask, getTopicContentByRoomId, getContentForHardCodedEnrichMessage } from "../utilities/moderatorTasks";
import { BaseProgressionWorkerTaskPayload } from "../types";
import { PARTICIPANTS_PER_ROOM } from "../config/constants";

export default createModeratedEnrichPromptTask<BaseProgressionWorkerTaskPayload>({
    getTaskInstruction: async () => {
        return `
            You are a moderator of a conversation between ${PARTICIPANTS_PER_ROOM} participants.
            Introduce the topic mentioned below to the participants.
            Do not great the participants.
            After the topic is presented you'll ask if there is anyone who wants to share their first thoughts on the topic.
            Limit your answer to three sentences.
        `;
    },
    getTaskContent: async (helpers) => {
        const { payload } = helpers;
        const { roomId } = payload;
        const topicContent = await getTopicContentByRoomId(roomId);

        return topicContent;
    },
    getBotMessageContent: async (helpers) => {
        const { result } = helpers;
        const { enrichment } = result;
     
        const contentOptions = ["Thanks for your introductions.", "Thanks everyone for introducing yourself.", "Thank you all for your introductions."]
        const thanksForIntroductionContent = await getContentForHardCodedEnrichMessage({contentOptions});
        return `${thanksForIntroductionContent} ${enrichment}`;
    },
});

// export async function enrichTopicIntroduction(payload: BaseProgressionWorkerTaskPayload) {
//     const { roomId } = payload;
//     const topicContent = await getTopicContentByRoomId(roomId);
//     const startTime = dayjs();
//     const waitingMessageInterval = setInterval(() => {
//         const passedTimeMs = dayjs().diff(startTime, 'ms');
//         console.info(`Waiting on NORMAL completion (${passedTimeMs})...`);
//     }, ONE_SECOND_MS * 3);

//     const completionResult = await openaiClient.completions.create({
//         model: 'text-davinci-003',
//         max_tokens: 1000,
//         prompt: `
//         You are a moderator of a conversation between ${PARTICIPANTS_PER_ROOM} participants.
    
//         Introduce the topic mentioned below to the participants.
//         After the topic is presented you'll ask if there is anyone who wants to share their first thoughts on the topic.
//         Limit your answer to three or four sentences.

//         Topic: ${topicContent}
//         `,
//     });

//     const content = completionResult.choices?.[0].text;

//     // disable debugging
//     clearInterval(waitingMessageInterval);

//     await sendBotMessage({
//         roomId,
//         content,
//     });
// }
