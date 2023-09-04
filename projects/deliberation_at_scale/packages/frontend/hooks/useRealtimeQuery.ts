import { QueryResult } from "@apollo/client";
import { REALTIME_POSTGRES_CHANGES_LISTEN_EVENT } from "@supabase/supabase-js";
import { useEffect } from "react";

import { supabaseClient } from "@/state/supabase";
import { apolloClient } from "@/state/apollo";

const ALL_TABLES_WILDCARD = '*';

export interface UseNestedLiveQueryOptions {
  channelName?: string;
  schemaName?: string;
  eventsLookup?: Record<string, REALTIME_POSTGRES_CHANGES_LISTEN_EVENT[]>;
  maxNestedDepth?: number;
}

export default function useRealtimeQuery<DataType>(queryResult: QueryResult<DataType>, options?: UseNestedLiveQueryOptions): QueryResult<DataType> {
  const {
    channelName = 'supabase_realtime',
    schemaName = 'public',
    eventsLookup = {
      [ALL_TABLES_WILDCARD]: [REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.ALL],
    },
    maxNestedDepth = 9999,
  } = options ?? {};
  const { data, loading, refetch } = queryResult;

  useEffect(() => {

    // guard: skip subscriptions when loading
    if (loading) {
      return;
    }

    const subscription = supabaseClient.channel(channelName);
    const candidateRowIdsLookup: Record<string, string[]> = {};
    const extractCandidateNodes = (node: any, depth: number) => {
      const typeName = node?.__typename;
      const id = node?.id;
      const isTrackableNode = !!typeName && !!id;

      // guard: skip when depth is too high
      if (depth > maxNestedDepth) {
        return;
      }

      // only if node is trackable by ID and typename add to the pool
      if (isTrackableNode) {
        candidateRowIdsLookup[typeName] = [
          ...(candidateRowIdsLookup[typeName] ?? []),
          id,
        ];
      }

      // attempt to track its properties / entries
      if (Array.isArray(node)) {
        node.map((nodeEntry) => {
          extractCandidateNodes(nodeEntry, depth + 1);
        });
      } else if (typeof node == 'object') {
        Object.values(node).map((nodeValue) => {
          extractCandidateNodes(nodeValue, depth + 1);
        });
      }
    };
    const shouldTrackOperation = (event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT, tableName: string) => {
      const shouldTrackAllTables = eventsLookup.hasOwnProperty(ALL_TABLES_WILDCARD);
      const shouldTrackTable = eventsLookup.hasOwnProperty(tableName) || shouldTrackAllTables;
      const events = eventsLookup?.[tableName] ?? eventsLookup?.[ALL_TABLES_WILDCARD] ?? [];

      // guard: when this table should not be tracked skip
      if (!shouldTrackTable) {
        return;
      }

      return events.includes(event);
    };

    // extract all the candidate nodes grouped by table name (aka typename)
    // this creates a lookup table to be handled for all the subscriptions looking like:
    // { messages: ['id1', 'id2', 'id3', 'id4'], topics: ['id1', 'id2'] }
    extractCandidateNodes(data, 0);

    const tableNames = Object.keys(candidateRowIdsLookup);
    let isTrackingSomething = false;

    tableNames.map((tableName) => {
      const rowIds = candidateRowIdsLookup[tableName];
      const joinedRowIds = rowIds.join(',');
      const nodeIdFilter = `id=in.(${joinedRowIds})`;
      const shouldTrackAllOperations = shouldTrackOperation(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.ALL, tableName);
      const shouldTrackInsert = shouldTrackOperation(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT, tableName) || shouldTrackAllOperations;
      const shouldTrackUpdate = shouldTrackOperation(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE, tableName) || shouldTrackAllOperations;
      const shouldTrackDelete = shouldTrackOperation(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.DELETE, tableName) || shouldTrackAllOperations;
      const shouldTrackNone = !shouldTrackInsert && !shouldTrackUpdate && !shouldTrackDelete;
      const getNodeId = (rowId: string) => {
        return `${tableName}:${rowId}`;
      };

      // guard: skip this entry when none should be tracked
      if (shouldTrackNone) {
        return;
      }

      // if not set this skips the subscription
      isTrackingSomething = true;

      if (shouldTrackInsert) {
        subscription.on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: schemaName,
            table: tableName,
          },
          (payload) => {
            refetch();
          }
        )
      }

      if (shouldTrackUpdate) {
        subscription.on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: schemaName,
            table: tableName,
            filter: nodeIdFilter,
          },
          (payload) => {
            refetch();
            // const newRow = payload.new;
            // const nodeId = getNodeId(newRow?.id);
            // const fields = new Proxy({}, {
            //   get(_target, prop) {
            //     if (typeof prop === 'string') {
            //       return newRow?.[prop];
            //     }
            //   },
            // });

            // apolloClient.cache.modify({
            //   id: nodeId,
            //   fields,
            // });
          }
        )
      }

      if (shouldTrackDelete) {
        subscription.on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: schemaName,
            table: tableName,
            filter: nodeIdFilter,
          },
          (payload) => {
            refetch();
          }
        )
      }
    });

    // guard: only subscribe when anything is tracked
    if (!isTrackingSomething) {
      return;
    }

    // subscribe to all the requested tables and nodes
    subscription.subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [JSON.stringify(data), loading, refetch]);

  return queryResult;
}
