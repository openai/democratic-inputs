:::mermaid
flowchart TD
    newMessage[New message]

    %% Equal contribution
    newMessage --> timeSinceFirstMessageInTopic{< 5 min since\ntopic start}

    timeSinceFirstMessageInTopic -- false --> unequalContribution([Unequal Contribution Check])

    allMessagesSinceTopicStart[(all messages\nsince topic start)] --> unequalContribution

    unequalContribution -- "{result: boolean, content: string | null}" --> unEqualContributionCheck{unequalContribution.result == true?}

    unEqualContributionCheck -- "{type: unequalCOntribution,\nmessage: unequalContribution.content}" --> moderationMessageHandler 

    %% Consensus
    newMessage --> allParticipantsHaveContributed{All participants\nhave message\nfor topic?}
    allMessagesSinceTopicStart --> allParticipantsHaveContributed

    allParticipantsHaveContributed -- true --> consensusCheck([Check for consensus])

    consensusCheck -- "{result: boolean }" --> consensusResult{consensusCheck.result == true?}

    allMessagesSinceTopicStart --> formulateConsensus
    consensusResult--> formulateConsensus([formulate consensus])
    formulateConsensus -- "{content: string }" --> formatConsensus[formulateConsensus]
    
    formatConsensus -- "{type: consensus,\n message: formulateConsensus.consensus }" --> moderationMessageHandler

    %% Bad language
    newMessage --> badLanguageCheck[badLanguage]

    badLanguageCheck --> isFlaggedByModeration([Is flagged by mod moderation API>])
    isFlaggedByModeration -- "{result: boolean, content: string}" --> sendModMessage{"if(flaggedByModeration.result \nor flaggedByRules.result)"}

    badLanguageCheck --> rulesCheck([Check message\nusing discussion rules])
    rulesCheck -- "{result: boolean, content: string}" --> sendModMessage

    sendModMessage -- true --> formulateModMessage(["writeModerationResponse(flaggedByModeration.content + flaggedByRules.content)"])

    formulateModMessage -- message --> createModeratorMessage[Create moderator message]

    createModeratorMessage -- "{type: badLanguage, message: message}" --> moderationMessageHandler


    %% Difficult language
    newMessage --> difficultLanguageCheck[difficultLanguage]

    difficultLanguageCheck --> difficultCheck([Check message\nusing difficulty rules])
    difficultCheck -- "{result: boolean, content: string}" --> sendDiffMessage{"if(difficultCheck.result)"}

    sendDiffMessage -- true --> formulateDiffMessage(["writeDifficultyResponse(difficultCheck.content)"])

    formulateDiffMessage -- message --> createDifficultyMessage[Create moderator message]

    createDifficultyMessage -- "{type: difficultLanguage, message: message}" --> moderationMessageHandler
:::