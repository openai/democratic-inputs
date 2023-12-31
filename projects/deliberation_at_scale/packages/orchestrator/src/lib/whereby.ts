import fetch from 'cross-fetch';
import { Dayjs } from 'dayjs';

import { ENABLE_TEST_WHEREBY_ROOM, TEST_WHEREBY_ROOM, WHEREBY_API_URL } from '../config/constants';

export interface ValidCreateExternalRoomResult {
    roomUrl: string;
    hostRoomUrl: string;
    meetingId: string;
    startDate: string;
    endDate: string;
}

export interface InvalidCreateExternalRoomResult {
    error: string;
    errorId: string;
    data: object;
    message: string;
}

export type CreateExternalRoomResult = ValidCreateExternalRoomResult | InvalidCreateExternalRoomResult;

/**
 * Create a Whereby meeting room.
 */
export async function createExternalRoom(endDate: Dayjs): Promise<ValidCreateExternalRoomResult> {
    const createRoomUrl = `${WHEREBY_API_URL}meetings`;
    const headers = {
        "Authorization": `Bearer ${process.env.WHEREBY_BEARER_TOKEN}`,
        "Content-Type": "application/json"
    };
    const body = {
        roomNamePrefix: 'das-',
        roomMode: 'group',
        endDate: endDate.toISOString(),
        fields: ['hostRoomUrl']
    };

    // guard: test if we are forcing the testing room
    if (ENABLE_TEST_WHEREBY_ROOM) {
        return TEST_WHEREBY_ROOM;
    }

    const rawCreationResult = await fetch(createRoomUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });
    const creationResult = await rawCreationResult.json();

    if (creationResult.error) {
        return Promise.reject(`Could not create a new Whereby room: ${JSON.stringify(creationResult)}`);
    }

    return creationResult as ValidCreateExternalRoomResult;
}
