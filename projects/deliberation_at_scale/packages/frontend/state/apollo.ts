import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { supabase } from './supabase';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
});

const authMiddleware = setContext(async () =>{
  const sessionData = await supabase.auth.getSession();
  const accessToken = sessionData.data.session?.access_token;
  const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return {
    headers: {
      apiKey,
      authorization: `Bearer ${accessToken}`,
    },
  };
});

export const apolloClient = new ApolloClient({
  link: from([authMiddleware, httpLink]),
  cache: new InMemoryCache(),
});
