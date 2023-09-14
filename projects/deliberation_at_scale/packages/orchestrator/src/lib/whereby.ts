
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

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
    const creationResult = await fetch(`${WHEREBY_API_URL}meetings`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.WHEREBY_BEARER_TOKEN}`,
            "Content-Type": 'application/json'
        },
        body: JSON.stringify({
            endDate: meetingEnd,
            fields: ['hostRoomUrl']
        }),
    });
    return creationResult.res.json();
}

const whereby = {
    createRoom,
};
export default whereby;
