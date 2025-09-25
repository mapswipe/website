const withExportImages = require('next-export-optimize-images');

const basePrefix = process.env.BASE_PREFIX;
const isBasePrefixAvailable = basePrefix !== undefined && basePrefix.trim().length > 0;

const nextConfig = withExportImages({
    output: 'export',
    trailingSlash: true,
    reactStrictMode: true,
    basePath: isBasePrefixAvailable ? `/${basePrefix}` : undefined,
    assetPrefix: isBasePrefixAvailable ? `/${basePrefix}/` : undefined,
    images: {
        domain: ['https://firebasestorage.googleapis.com/v0/b/msf-mapswipe.appspot.com'],
        deviceSizes: [640, 960, 1280, 1600, 1920],
    },
});

module.exports = nextConfig;
