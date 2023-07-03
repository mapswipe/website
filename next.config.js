const withExportImages = require('next-export-optimize-images');

const nextConfig = withExportImages({
    output: 'export',
    trailingSlash: true,
    reactStrictMode: true,
    images: {
        domain: ['https://firebasestorage.googleapis.com/v0/b/msf-mapswipe.appspot.com'],
        deviceSizes: [640, 960, 1280, 1600, 1920],
    },
});

module.exports = nextConfig;
