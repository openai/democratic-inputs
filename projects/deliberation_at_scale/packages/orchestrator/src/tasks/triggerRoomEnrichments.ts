import { Helpers } from "graphile-worker";

export interface TriggerRoomEnrichmentsPayload {
    roomId: string;
}

export default async function triggerRoomEnrichments(payload: TriggerRoomEnrichmentsPayload, helpers: Helpers) {
    const { roomId } = payload;

    helpers.logger.info(`Triggering enrichments for room: ${roomId}`);
}
