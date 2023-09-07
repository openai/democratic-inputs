'use client';
import { ApolloProvider } from '@apollo/client';
import { Provider as ReduxProvider } from 'react-redux';

import { apolloClient } from '@/state/apollo';
import store from '@/state/store';

interface Props {
  children: React.ReactNode
}

export default function Providers({ children }: Props) {
    return (
        <ApolloProvider client={apolloClient}>
            <ReduxProvider store={store}>
                {children}
            </ReduxProvider>
        </ApolloProvider>
    );
}
