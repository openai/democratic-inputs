const { locales, defaultLocale } = require('./locales');

/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
    locales,
    pseudoLocale: 'pseudo',
    sourceLocale: defaultLocale,
    fallbackLocales: {
        default: 'en'
    },
    catalogs: [
        {
            path: 'locales/{locale}',
            include: ['./']
        }
    ]
};
