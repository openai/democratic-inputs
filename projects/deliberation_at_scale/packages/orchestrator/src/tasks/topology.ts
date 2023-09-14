export default function topology() {
    const moderatorBehaviour = {
        topology: [
            {
                // NOTE: the tasks should happen the fixed order below, not simoultaniusly
                id: 'introduce',
                tasks: ['introductionParticipants', 'introductionModerator', 'introductionTopic'],
            },
            {
                // first check whether  after introduction a 'safe' environment is established
                id: 'safe',
                tasks: ['emotionalWellbeing', 'badLanguage']
            },
            {
                // check whether there is a good understanding among the group
                id: 'understand',
                tasks: ['difficultLanguage', 'badLanguage', 'offTopic'],
            },
            {
                // the following things should hold:
                // REAL TIME:
                // badLangauge

                // EVERY MINUTE:
                // enoughContent over the whole conversation
                // offTopic over the last minute

                // EVERY THREE MINUTES
                // equalParticipation

                id: 'conversate',
                tasks: ['enoughContent', 'equalParticipation', 'badLanguage', 'offTopic'],
            },
            {
                // try to formulate a consensus and proposes this
                id: 'results',
                tasks: ['consensusForming', 'badLanguage'],
            },
            {
                id: 'continue',
                tasks: ['introductionTopic']
            },
            {
                // after voting on consensus try to wrap it up
                id: 'closure',
                tasks: ['closureSession']
            }
        ],
    };

}

