const langConfig = require('./i18next-parser.config.js');

/** @type {import('next-i18next').UserConfig} */
module.exports = {
    // debug: process.env.NODE_ENV === 'development',
    // reloadOnPrerender: process.env.NODE_ENV === 'development',
    i18n: {
        defaultLocale: 'en',
        locales: langConfig.locales,
    },
    returnEmptyString: false,
};
