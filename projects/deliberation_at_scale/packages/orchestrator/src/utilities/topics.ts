import { supabaseClient } from "../lib/supabase";
import { getRoomById } from "./rooms";

export async function getTopicById(topicId: string) {
    const topicData = await supabaseClient
        .from('topics')
        .select()
        .eq('active', true)
        .eq('id', topicId)
        .limit(1);

    return topicData.data?.[0];
}

export async function getTopicContentByRoomId(roomId: string) {
    const room = await getRoomById(roomId);
    const topicId = room?.topic_id;

    if (!topicId) {
        throw Error(`Could not get valid topic content for room ${roomId} because there is no topic ID.`);
    }

    const topic = await getTopicById(topicId);
    const { content } = topic ?? {};

    if (!content) {
        throw Error(`Could not get valid topic content for topic ${topicId}.`);
    }

    return content;
}
