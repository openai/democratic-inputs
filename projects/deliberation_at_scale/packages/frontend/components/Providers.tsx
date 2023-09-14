'use client';
import { ApolloProvider } from '@apollo/client';
import { Provider as ReduxProvider } from 'react-redux';

import { apolloClient } from '@/state/apollo';
import store from '@/state/store';
import ConditionalLocalMediaProvider from './LocalMedia/conditional';
import ConditionalRoomConnectionProvider from './RoomConnection/conditional';

interface Props {
    children: React.ReactNode
}

export default function Providers({ children }: Props) {
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
