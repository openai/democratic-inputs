import { supabaseClient } from "@/state/supabase";
import { REALTIME_LISTEN_TYPES, RealtimeChannel } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";

interface EventHandler {
    event: string;
    handler: (payload: any) => void;
}

export interface UseRealtimeBroadcastOptions {
    channelId?: string;
    eventHandlers: EventHandler[];
    type?: REALTIME_LISTEN_TYPES.BROADCAST;
}

export default function useRealtimeBroadcast(options: UseRealtimeBroadcastOptions) {
    const memoizedOptions = useMemo(() => {
        return options;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(options)]);
    const { channelId, eventHandlers, type = REALTIME_LISTEN_TYPES.BROADCAST } = memoizedOptions;
    const [channel, setChannel] = useState<RealtimeChannel | null>(null);
    const sendToChannel = useCallback(async (event: string, payload: object) => {
        return await channel?.send({
            type,
            event,
            payload,
        });
    }, [channel, type]);

    useEffect(() => {
        if (!channelId) {
            return;
        }

        const newChannel = supabaseClient.channel(channelId);

        eventHandlers.forEach(({ event, handler }) => {
            newChannel.on(type, { event }, handler);
        });

        newChannel.subscribe((status) => {
            if (status != "SUBSCRIBED") {
                // eslint-disable-next-line no-console
                console.error(`Could not subscribe to channel: ${channelId}`);
                return;
            }

            setChannel(newChannel);
        });

        return () => {
            newChannel.unsubscribe();
        };
    }, [channelId, eventHandlers, type]);

    return {
        sendToChannel,
    };
}
