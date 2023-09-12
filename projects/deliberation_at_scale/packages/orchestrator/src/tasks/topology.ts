const moderatorBehaviour2 = {
    topology: [
        {
            id: 'safe',
            tasks: [
                {
                    id: 'emotionalWellbeing',
                    active: true,
                    fallbackEnabled: false,
                },
                {
                    id: 'badLanguage',
                    active: true,
                    fallbackEnabled: true,
                },
            ],
        },
        {
            id: 'informed',
            tasks: ['clarify', 'confusion'],
        },
        {
            id: 'debate',
            tasks: ['enoughContent', 'activeParticipation', 'fairParticipation'],
        },
        {
            id: 'results',
            tasks: ['consensus'],
        },
    ],
};

const tasks = {
    emotionalWellbeing: {
        type: 'openai-gpt',
    },
    badLanguage: {
        type: 'openai-moderation',
        context: {
            messages: {
                historyCutoff: 10 * 60 * 1000,
            },
            participants: {
                participantIds: ['1'],
            },
        },
    },
};