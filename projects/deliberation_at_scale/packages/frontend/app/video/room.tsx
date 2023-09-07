import { useCallback, useState } from 'react';
import { LocalMediaProvider } from '@/hooks/useLocalMedia';
import RequestPermissions from './request-permissions';
import Call from './call';

export type RoomJoinStatus = 'INIT' | 'REQUEST_PERMISSIONS' | 'JOIN';

export default function Room() {
    const [status, setStatus] = useState<RoomJoinStatus>('INIT');

    const handleAskPermissions = useCallback(() => setStatus('REQUEST_PERMISSIONS'), []);
    const handleJoinRoom = useCallback(() => setStatus('JOIN'), []);

    return (
        <div className="w-full flex items-center flex-col p-4">
            {status === 'INIT' ? (
                <button
                    className="bg-white shadow rounded py-3 px-4"
                    onClick={handleAskPermissions}
                >
                    Ask for permissions
                </button>
            ) : (
                <LocalMediaProvider>
                    {status === 'REQUEST_PERMISSIONS' ? (
                        <>
                            <RequestPermissions />
                            <button
                                className="bg-white shadow rounded py-3 px-4"
                                onClick={handleJoinRoom}
                            >
                                Join room
                            </button>
                        </>
                    ) : (
                        <Call />
                    )}
                </LocalMediaProvider>
            )}
        </div>
    );
}