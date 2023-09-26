import { isEmpty } from "radash";
import { supabaseClient } from "../lib/supabase";
import { BaseProgressionWorkerTaskPayload } from "../types";
import { ResultTaskHelpers, CreateModeratorTaskOptions } from "./tasks";
import { getMessagesByContext } from "./messages";

interface StoreOutcomeOptions<PayloadType, ResultType> {
    helpers: ResultTaskHelpers<PayloadType, ResultType>;
    getOutcomeSourcesMessageIds: CreateModeratorTaskOptions<PayloadType, ResultType>['getOutcomeSourcesMessageIds'];
    getOutcomeContent: CreateModeratorTaskOptions<PayloadType, ResultType>['getOutcomeContent'];
    getOutcomeType: CreateModeratorTaskOptions<PayloadType, ResultType>['getOutcomeType'];
}

export async function storeOutcome<PayloadType, ResultType>(options: StoreOutcomeOptions<PayloadType, ResultType>) {
    const { helpers, getOutcomeSourcesMessageIds, getOutcomeContent, getOutcomeType } = options;
    const messageIds = await getOutcomeSourcesMessageIds?.(helpers) ?? [];
    const outcomeContent = await getOutcomeContent?.(helpers);
    const outcomeType = await getOutcomeType?.(helpers);

    // guard: an outcome cannot exist with a credible source, in this case the messages
    if (!outcomeContent || !outcomeType || isEmpty(messageIds)) {
        return;
    }

    // store the outcome to get the outcome ID to use for the outcome sources
    const { data: outcomeData } = await supabaseClient
        .from("outcomes")
        .insert({
            content: outcomeContent,
            type: outcomeType,
        })
        .select();
    const outcomeId = outcomeData?.[0]?.id;

    // guard: make sure there is an outcome
    if (!outcomeId) {
        helpers.helpers.logger.error(`Could not create an outcome with content ${outcomeContent} for job payload ${JSON.stringify(helpers.payload)}`);
        return;
    }

    const outcomeSourcesResult = await supabaseClient
        .from("outcome_sources")
        .insert(messageIds?.map((messageId) => {
            return {
                outcome_id: outcomeId,
                message_id: messageId,
            };
        }))
        .select();

    // check if all message references were stored
    if ((outcomeSourcesResult?.data?.length ?? 0) < messageIds.length) {
        helpers.helpers.logger.error(`Could not create all outcome sources for outcome: ${outcomeId}`);
    }
}

export async function getDefaultOutsomeSourcesMessageIds<PayloadType extends BaseProgressionWorkerTaskPayload, ResultType>(helpers: ResultTaskHelpers<PayloadType, ResultType>) {
    const { payload } = helpers;
    const { roomId, progressionTask } = payload;
    const messageContext = progressionTask.context?.messages;

    if (!messageContext) {
        return [];
    }

    const messages = await getMessagesByContext(roomId, messageContext);
    const messageIds = messages.map((message) => message.id);

    return messageIds;
}
