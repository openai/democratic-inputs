"use client";

import useProfile from "@/hooks/useProfile";
export default function Index() {
    const { rooms } = useProfile();

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-4xl justify-between items-center p-3 text-sm text-foreground">
                <p>Previously joined rooms:</p>
                <ul>
                    {rooms?.map((room, roomIndex) => {
                        const { id, topics } = room.node;
                        const { content: topicContent } = topics;

                        return (
                            <li key={id}>#{roomIndex + 1}: {topicContent}</li>
                        );
                    })}
                </ul>
                <br/>
                <button>START ROOM</button>
            </div>
        </div>
    );
}
