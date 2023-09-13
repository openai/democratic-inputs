import { Helpers } from "graphile-worker";

export interface TriggerEnrichmentsPayload {
    roomId: string;
}

export default async function triggerEnrichments(payload: TriggerEnrichmentsPayload, helpers: Helpers) {
    const { roomId } = payload;

    helpers.logger.info(`Triggering enrichments for room: ${roomId}`);
}
