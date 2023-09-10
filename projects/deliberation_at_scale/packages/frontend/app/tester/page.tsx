"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useGetTopicsQuery, useStartRoomMutation } from "@/generated/graphql";
import useProfile from "@/hooks/useProfile";
import { useAppDispatch } from "@/state/store";
import { joinRoom } from "@/state/slices/room";

export default function Index() {
    const { rooms } = useProfile();
    const dispatch = useAppDispatch();
    const { push } = useRouter();
    const [startRoom, { loading: loadingStartRoom }] = useStartRoomMutation();
    const { data: topicsData } = useGetTopicsQuery();
    const topics = topicsData?.topicsCollection?.edges;
    const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-4xl justify-between items-center p-3 text-sm text-foreground">
                <h1>Room creator:</h1>
                <select onChange={(event) => setSelectedTopicId(event.target.value)} className="bg-gray-400/20">
                    <option>Select topic</option>
                    {topics?.map((topic) => {
                        const { id: topicId, content: topicContent } = topic?.node ?? {};

                        return (
                            <option key={topicId} value={topicId}>{topicContent}</option>
                        );
                    })}
                </select>
                <br/>
                <button disabled={loadingStartRoom || !selectedTopicId} onClick={() => {
                    startRoom({
                        variables: {
                            topicId: selectedTopicId,
                        },
                    });
                }}>{loadingStartRoom ? 'Starting room...' : 'START NEW ROOM'}</button>
                <br/><br/>
                <h1>Room joiner:</h1>
                <ul>
                    {rooms?.map((room) => {
                        const { id, topics } = room.node;
                        const { content: topicContent } = topics;

                        return (
                            <li key={id}>
                                <button onClick={() => {
                                    dispatch(joinRoom(id));
                                    push(`/room/${id}/ai`);
                                }}>JOIN</button>&nbsp;
                                {id}: {topicContent}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
