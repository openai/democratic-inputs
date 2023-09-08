import { QueryResult, gql } from "@apollo/client";
import { REALTIME_POSTGRES_CHANGES_LISTEN_EVENT } from "@supabase/supabase-js";
import { useEffect } from "react";

import { supabaseClient } from "@/state/supabase";
import { get, isEmpty, set } from "radash";

export interface UseNestedLiveQueryOptions {
  channelName?: string;
  schemaName?: string;
  tableEventsLookup?: TableEventsLookup;
  maxNestedDepth?: number;
}

export interface TableEvents {
  listenOperations?: TableOperation[];
  listenFilters?: Partial<Record<TableOperation, string>>;
  refetchOperations?: TableOperation[];
  evictOnDelete?: boolean;
  appendOnInsertEdgePaths?: string[];
}

export type TableEventsLookup = Record<string, TableEvents>;

export type TableOperation = '*' | 'INSERT' | 'UPDATE' | 'DELETE';

const allTablesWildcard = '*';
const defaultListenOperations: TableOperation[] = ['*'];
const defaultRefetchOperations: TableOperation[] = ['INSERT'];
const defaultEvictOnDelete = true;
const defaultAppendOnInsertEdgePaths: string[] = [];
const defaultTableEventsLookup: TableEventsLookup = {
    [allTablesWildcard]: {
        listenOperations: defaultListenOperations,
        refetchOperations: defaultRefetchOperations,
        evictOnDelete: defaultEvictOnDelete,
        appendOnInsertEdgePaths: defaultAppendOnInsertEdgePaths,
    },
};

export default function useRealtimeQuery<DataType>(queryResult: QueryResult<DataType>, options?: UseNestedLiveQueryOptions): QueryResult<DataType> {
    const {
        channelName = 'supabase_realtime',
        schemaName = 'public',
        tableEventsLookup = defaultTableEventsLookup,
        maxNestedDepth = 9999,
    } = options ?? {};
    const { data, loading, refetch, client: apolloClient, observable: { query } } = queryResult;
    const { cache } = apolloClient;

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
        // eslint-disable-next-line no-prototype-builtins
        const shouldHandleAllTables = tableEventsLookup.hasOwnProperty(allTablesWildcard);
        const getTableEvents = (tableName: string) => {
            return tableEventsLookup?.[tableName] ?? defaultTableEventsLookup?.[allTablesWildcard];
        };
        const shouldHandleOperation = (operationsKey: 'listenOperations' | 'refetchOperations', defaultOperations: TableOperation[], operation: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT, tableName: string) => {
            const tableEvents = getTableEvents(tableName);
            // eslint-disable-next-line no-prototype-builtins
            const shouldHandleTable = tableEventsLookup.hasOwnProperty(tableName) || shouldHandleAllTables;
            const operations = tableEvents?.[operationsKey] ?? defaultOperations;
            const shouldHandleOperation = operations.includes(operation) || operations.includes('*');

            return shouldHandleTable && shouldHandleOperation;
        };
        const shouldListenToOperation = (operation: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT, tableName: string) => {
            return shouldHandleOperation('listenOperations', defaultListenOperations, operation, tableName);
        };
        const shouldRefetchOnOperation = (operation: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT, tableName: string) => {
            return shouldHandleOperation('refetchOperations', defaultRefetchOperations, operation, tableName);
        };

        // extract all the candidate nodes grouped by table name (aka typename)
        // this creates a lookup table to be handled for all the subscriptions looking like:
        // { messages: ['id1', 'id2', 'id3', 'id4'], topics: ['id1', 'id2'] }
        extractCandidateNodes(data, 0);

        const tableNames = Object.keys(candidateRowIdsLookup);
        let isTrackingSomething = false;

        tableNames.map((tableName) => {
            const tableEvents = getTableEvents(tableName);
            const rowIds = candidateRowIdsLookup[tableName];
            const joinedRowIds = rowIds.join(',');
            const nodeIdFilter = `id=in.(${joinedRowIds})`;

            // check which operations we should listen to
            const shouldListenToAllOperations = shouldListenToOperation(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.ALL, tableName);
            const shouldListenToInsert = shouldListenToOperation(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT, tableName) || shouldListenToAllOperations;
            const shouldListenToUpdate = shouldListenToOperation(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE, tableName) || shouldListenToAllOperations;
            const shouldListenToDelete = shouldListenToOperation(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.DELETE, tableName) || shouldListenToAllOperations;
            const shouldListenToNone = !shouldListenToInsert && !shouldListenToUpdate && !shouldListenToDelete;

            // check on which operations the whole query needs to be rerun
            const shouldRefetchOnAllOperations = shouldRefetchOnOperation(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.ALL, tableName);
            const shouldRefetchOnInsert = shouldRefetchOnOperation(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT, tableName) || shouldRefetchOnAllOperations;
            const shouldRefetchOnUpdate = shouldRefetchOnOperation(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE, tableName) || shouldRefetchOnAllOperations;
            const shouldRefectchOnDelete = shouldRefetchOnOperation(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.DELETE, tableName) || shouldRefetchOnAllOperations;

            // delete handlers
            const shouldEvictOnDelete = tableEvents?.evictOnDelete ?? defaultEvictOnDelete;

            // insert handlers
            const appendOnInsertEdgePaths = tableEvents?.appendOnInsertEdgePaths ?? defaultAppendOnInsertEdgePaths;
            const shouldInsertForEdgePaths = !isEmpty(appendOnInsertEdgePaths);

            // any filters on the operation listeners that might be overriden or can be the default
            const listenFilters = tableEvents?.listenFilters;
            const insertFilter = listenFilters?.INSERT ?? undefined;
            const updateFilter = listenFilters?.UPDATE ?? nodeIdFilter;
            const deleteFilter = listenFilters?.DELETE ?? nodeIdFilter;

            const getNodeId = (rowId: string) => {
                return `${tableName}:${rowId}`;
            };

            // guard: skip this entry when none should be tracked
            if (shouldListenToNone) {
                return;
            }

            // if not set this skips the subscription
            isTrackingSomething = true;

            if (shouldListenToInsert) {
                subscription.on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: schemaName,
                        table: tableName,
                        filter: insertFilter,
                    },
                    (payload) => {
                        const newRow = payload.new;

                        if (shouldRefetchOnInsert) {
                            refetch();
                        }

                        if (shouldInsertForEdgePaths) {
                            appendOnInsertEdgePaths.map((path) => {
                                const edgePath = `${path}.edges`;
                                const currentEdges = get(data, edgePath);
                                const newNode = {
                                    __typename: tableName,
                                    ...newRow,
                                };
                                const newEdge = {
                                    __typename: `${tableName}Edge`,
                                    node: newNode
                                };

                                // guard: ensure this is an array
                                if (!Array.isArray(currentEdges)) {
                                    return;
                                }

                                const cacheMutationData = set({}, edgePath, [
                                    ...currentEdges,
                                    newEdge,
                                ]);

                                cache.writeQuery({
                                    query,
                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                    // @ts-ignore
                                    data: cacheMutationData,
                                });
                            });
                        }
                    }
                );
            }

            if (shouldListenToUpdate) {
                subscription.on(
                    "postgres_changes",
                    {
                        event: "UPDATE",
                        schema: schemaName,
                        table: tableName,
                        filter: updateFilter,
                    },
                    (payload) => {
                        const newRow = payload.new;
                        const fragment = `
                            fragment UpdatedRow on ${tableName} {
                                ${Object.keys(newRow).join(", ")}
                            }
                        `;

                        cache.writeFragment({
                            id: getNodeId(newRow?.id),
                            data: newRow,
                            fragment: gql(fragment),
                        });
                        if (shouldRefetchOnUpdate) {
                            refetch();
                        }
                    }
                );
            }

            if (shouldListenToDelete) {
                subscription.on(
                    "postgres_changes",
                    {
                        event: "DELETE",
                        schema: schemaName,
                        table: tableName,
                        filter: deleteFilter,
                    },
                    (payload) => {
                        const { id: deletedId } = payload.old;

                        if (shouldRefectchOnDelete) {
                            refetch();
                        }

                        if (shouldEvictOnDelete && deletedId) {
                            const normalizedId = cache.identify({
                                id: deletedId,
                                __typename: tableName,
                            });

                            cache.evict({ id: normalizedId });
                        }
                    }
                );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channelName, JSON.stringify(data), loading, maxNestedDepth, refetch, schemaName, JSON.stringify(tableEventsLookup)]);

    return queryResult;
}