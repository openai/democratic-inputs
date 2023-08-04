import express from 'express';
import { express as voyagerMiddleware } from 'graphql-voyager/middleware';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { schemaFromExecutor } from '@graphql-tools/wrap';
import { stitchSchemas } from '@graphql-tools/stitch';
import { createYoga } from 'graphql-yoga';

import { GRAPHQL_URL, VOYAGER_SERVER_PORT, SUPABASE_ANONYMOUS_API_KEY } from '../config/constants';

const VOYAGER_PATH = '/voyager';
const GRAPHQL_PATH = '/graphql';

async function main() {
  const expressApp = express();
  const remoteExecutor = buildHTTPExecutor({
    endpoint: GRAPHQL_URL,
    headers: {
      apiKey: SUPABASE_ANONYMOUS_API_KEY,
    },
  });
  const dataCoreSchema = {
    schema: await schemaFromExecutor(remoteExecutor),
    executor: remoteExecutor
  };
  const gatewaySchema = stitchSchemas({
    subschemas: [dataCoreSchema]
  });
  const gatewayServer = createYoga({ schema: gatewaySchema });

  expressApp.use(GRAPHQL_PATH, gatewayServer);
  expressApp.use(VOYAGER_PATH, voyagerMiddleware({
    endpointUrl: GRAPHQL_PATH,
  }));

  expressApp.listen(VOYAGER_SERVER_PORT);
}

(async () => {
  main();
})();
