'use client';
import { ApolloProvider } from '@apollo/client';
import { Provider as ReduxProvider } from 'react-redux';

import { apolloClient } from '@/state/apollo';
import store from '@/state/store';
import ConditionalLocalMediaProvider from './LocalMedia/conditional';
import ConditionalRoomConnectionProvider from './RoomConnection/conditional';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/state/supabase';

interface Props {
    children: React.ReactNode;
}

export default function Providers({ children }: Props) {
    // Get access token and refresh token from query params
    const params = useSearchParams();
    const accessToken = params?.get('access_token') as string;
    const refreshToken = params?.get('refresh_token') as string;

    useEffect(() => {
        if (!accessToken || !refreshToken) {
            return;
        }

        supabaseClient.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        });
    }, [accessToken, refreshToken]);

    return (
        <ApolloProvider client={apolloClient}>
            <ReduxProvider store={store}>
                <ConditionalLocalMediaProvider>
                    <ConditionalRoomConnectionProvider>
                        {children}
                    </ConditionalRoomConnectionProvider>
                </ConditionalLocalMediaProvider>
            </ReduxProvider>
        </ApolloProvider>
    );
}
