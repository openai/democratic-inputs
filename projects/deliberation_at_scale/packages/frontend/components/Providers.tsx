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
import { Toaster } from 'react-hot-toast';

interface Props {
    children: React.ReactNode;
}

export default function Providers({ children }: Props) {
    // Get access token and refresh token from query params
    const params = useSearchParams();
    const accessToken = params?.get('access_token') as string;
    const refreshToken = params?.get('refresh_token') as string;

    // login using the hash parameter provided by Supabase
    useEffect(() => {
        const hash = window.location.hash;
        const formattedHash = hash.slice(1);
        const result = formattedHash.split('&').reduce(function (res: Record<string, string>, item) {
            const parts: string[] = item.split('=');
            res[parts[0]] = parts[1];
            return res;
        }, {});
        const accessToken = result['access_token'];
        const refreshToken = result['refresh_token'];
        supabaseClient.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        });
    }, []);

    // using the query parameters provided by us
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
                        <Toaster position='bottom-center'/>
                    </ConditionalRoomConnectionProvider>
                </ConditionalLocalMediaProvider>
            </ReduxProvider>
        </ApolloProvider>
    );
}
