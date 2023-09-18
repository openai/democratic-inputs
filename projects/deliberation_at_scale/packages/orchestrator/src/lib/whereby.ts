
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import fetch from 'cross-fetch';


declare global {
    namespace NodeJS {
        interface ProcessEnv {
            WHEREBY_BEARER_TOKEN: string;
        }
    }
}

const WHEREBY_API_URL = 'https://api.whereby.dev/v1/';

// guard: check that the whereby token is present
if (!('WHEREBY_BEARER_TOKEN' in process.env)) {
    // eslint-disable-next-line no-console
    console.error('Please set WHEREBY_BEARER_TOKEN in your environment or in your .env file.');
    process.exit(1);
}


interface CreateRoomResponse {
    roomURL: string;
    hostRoomUrl: string;
    meetingId: string;
    startDate: string;
    endDate: string;
}

/**
  * @brief creates a room which is available up til an hour after the end date.
  * @note  if no end date is provided it will use the currentTime as a starting time
**/
export async function createRoom(endDate?: Date): Promise<CreateRoomResponse> {
    const meetingEnd = endDate?.toISOString() || new Date().toISOString();

    const createRoomUrl = `${WHEREBY_API_URL}meetings`;
    const headers = {
        Authorization: `Bearer ${process.env.WHEREBY_BEARER_TOKEN}`,
        "Content-Type": "application/json"
    };
    const body = {
        endDate: meetingEnd,
        fields: ['hostRoomUrl']
    };

    const creationResult = await fetch(createRoomUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });

    return creationResult.json();
}

const whereby = {
    createRoom,
};
export default whereby;
