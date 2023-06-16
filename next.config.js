const withExportImages = require('next-export-optimize-images');

const nextConfig = withExportImages({
    output: 'export',
    reactStrictMode: true,
    images: {
        // domain: ['localhost: 8020'],
        deviceSizes: [640, 960, 1280, 1600, 1920],
    },
});

module.exports = nextConfig;
