'use client';
import { ApolloProvider } from '@apollo/client';
import { Provider as ReduxProvider } from 'react-redux';

import { apolloClient } from '@/state/apollo';
import store from '@/state/store';
import dynamic from 'next/dynamic';

interface Props {
  children: React.ReactNode
}

const LocalMediaProvider = dynamic(async () => (
    (await import('@/components/LocalMedia/provider')).ConditionalLocalMediaProvider
), { ssr: false });

export default function Providers({ children }: Props) {
    return (
        <ApolloProvider client={apolloClient}>
            <ReduxProvider store={store}>
                <LocalMediaProvider>
                    {children}
                </LocalMediaProvider>
            </ReduxProvider>
        </ApolloProvider>
    );
}
