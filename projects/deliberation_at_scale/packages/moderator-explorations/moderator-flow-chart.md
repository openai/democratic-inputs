:::mermaid
flowchart TD
    newMessage[New message]

    newMessage --> timeSinceFirstMessageInTopic{< 5 min since\ntopic start}

    timeSinceFirstMessageInTopic -- false --> unequalContribution([Unequal Contribution Check])

    allMessagesSinceTopicStart[(all messages\nsince topic start)] --> unequalContribution

    unequalContribution -- "{result: boolean, content: string | null}" --> unEqualContributionCheck{unequalContribution.result == true?}

    unEqualContributionCheck -- "{type: unequalCOntribution,\nmessage: unequalContribution.content}" --> moderationMessageHandler 

    newMessage --> allParticipantsHaveContributed{All participants\nhave message\nfor topic?}
    allMessagesSinceTopicStart --> allParticipantsHaveContributed

    allParticipantsHaveContributed -- true --> consensusCheck([Check for consensus])

    consensusCheck -- "{result: boolean }" --> consensusResult{consensusCheck.result == true?}


    allMessagesSinceTopicStart --> formulateConsensus
    consensusResult--> formulateConsensus([formulate consensus])
    formulateConsensus -- "{content: string }" --> formatConsensus[formulateConsensus]
    
    formatConsensus -- "{type: consensus,\n message: formulateConsensus.consensus }" --> moderationMessageHandler

:::