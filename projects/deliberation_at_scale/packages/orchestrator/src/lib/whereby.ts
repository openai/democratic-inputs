import fetch from 'cross-fetch';
import { Dayjs } from 'dayjs';

import { WHEREBY_API_URL } from '../config/constants';

interface CreateExternalRoomResult {
    roomURL: string;
    hostRoomUrl: string;
    meetingId: string;
    startDate: string;
    endDate: string;
}

/**
 * Create a Whereby meeting room.
 */
export async function createExternalRoom(endDate: Dayjs): Promise<CreateExternalRoomResult> {
    const createRoomUrl = `${WHEREBY_API_URL}meetings`;
    const headers = {
        Authorization: `Bearer ${process.env.WHEREBY_BEARER_TOKEN}`,
        "Content-Type": "application/json"
    };
    const body = {
        endDate: endDate.toISOString(),
        fields: ['hostRoomUrl']
    };

    const creationResult = await fetch(createRoomUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });

    return creationResult.json();
}
