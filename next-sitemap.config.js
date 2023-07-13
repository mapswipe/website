/** @type {import('next-sitemap').IConfig} */

const config = {
    siteUrl: process.env.MAPSWIPE_DEPLOYMENT_URL || 'https://mapswipe.org/',
    exclude: ['/404'],
    generateRobotsTxt: true,
    outDir: './out',
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                disallow: ['/404'],
            },
            { userAgent: '*', allow: '/' },
        ],
    },
};

module.exports = config;
