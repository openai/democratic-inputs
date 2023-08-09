import express from 'express';
import { express as voyagerMiddleware } from 'graphql-voyager/middleware';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { schemaFromExecutor } from '@graphql-tools/wrap';
import { stitchSchemas } from '@graphql-tools/stitch';
import { createYoga } from 'graphql-yoga';
import debug from 'debug';

import { GRAPHQL_URL, VOYAGER_SERVER_PORT, SUPABASE_ANONYMOUS_API_KEY } from '../config/constants';

const VOYAGER_PATH = '/voyager';
const GRAPHQL_PATH = '/graphql';
const logger = debug('voyager');

export async function startVoyagerServer() {
  logger('Initializing server...');
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
  logger(`Server started and is listening on port ${VOYAGER_SERVER_PORT}...`);
}
