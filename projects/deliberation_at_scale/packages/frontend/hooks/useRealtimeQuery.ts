import { QueryResult, gql } from "@apollo/client";
import { REALTIME_POSTGRES_CHANGES_LISTEN_EVENT, RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import objectHash from "object-hash";
import { get, isEmpty, set } from "radash";

import { supabaseClient } from "@/state/supabase";

export interface UseNestedLiveQueryOptions {
    channelPrefix?: string;
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

export default function useRealtimeQuery<DataType>(queryResult: QueryResult<DataType, any>, options?: UseNestedLiveQueryOptions): QueryResult<DataType> {
    const {
        channelPrefix = 'realtime',
        schemaName = 'public',
        tableEventsLookup = defaultTableEventsLookup,
        maxNestedDepth = 9999,
    } = options ?? {};
    const {
        data, loading, refetch,
        client: apolloClient,
        observable: { query: query, variables: queryVariables },
    } = queryResult;
    const { cache } = apolloClient;
    const [trackedSubscription, setTrackedSubscription] = useState<RealtimeChannel | null>(null);
    const trackedSubscriptionState = trackedSubscription?.state;

    // handle disconnects
    useEffect(() => {
        if (trackedSubscriptionState !== 'errored') {
            return;
        }

        console.error('Subscription has errored, refetching and re-subscribing...');
        console.error('This was or the following query:', query);
        refetch();
    }, [refetch, trackedSubscriptionState, query]);

    useEffect(() => {

        // guard: skip subscriptions when loading
        if (loading) {
            return;
        }

        const candidateRowIdsLookup: Record<string, string[]> = {};
        const extractCandidateNodes = (node: any, depth: number) => {
            const typeName: string = node?.__typename;
            const id = node?.id;
            const isTrackableConnection = !!typeName && typeName.endsWith('Connection');
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

            // only if this might be a connection which is potentially empty without any records
            // we still want to track the connection when a first entry is added
            if (isTrackableConnection) {
                const tableTypeName = typeName.replaceAll('Connection', '');
                candidateRowIdsLookup[tableTypeName] = [];
            }

            // attempt to track its properties / entries
            if (Array.isArray(node)) {
                node.map((nodeEntry) => {
                    extractCandidateNodes(nodeEntry, depth + 1);
                });
            } else if (!!node && typeof node == 'object') {
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

        const channelName = `${channelPrefix}_${objectHash({ options, candidateRowIdsLookup })}`;
        const subscription = supabaseClient.channel(channelName);
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

                                const cacheMutationData = set({ __typename:  `${tableName}Connection` }, edgePath, [
                                    ...currentEdges,
                                    newEdge,
                                ]);

                                cache.writeQuery({
                                    query,
                                    variables: queryVariables,
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
        subscription.subscribe((status) => {

            if (status === 'SUBSCRIBED') {
                console.log(`Subscription successfully subscribed with status: ${status}`);
                setTrackedSubscription(() => {
                    return subscription;
                });
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                console.error(`Subscription failed to subscribe and gave status: ${status}`);
            }
        });

        return () => {
            setTrackedSubscription(() => {
                return null;
            });
            subscription.unsubscribe();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(data), loading, maxNestedDepth, refetch, schemaName, JSON.stringify(tableEventsLookup), setTrackedSubscription]);

    return queryResult;
}
