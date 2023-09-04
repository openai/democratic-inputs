'use client';
import { ApolloProvider } from '@apollo/client';

import { apolloClient } from '@/state/apollo';

interface Props {
  children: React.ReactNode
}

export default function Providers({ children }: Props) {
  return (
    <ApolloProvider client={apolloClient}>
      {children}
    </ApolloProvider>
  );
}
