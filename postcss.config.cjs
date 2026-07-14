// Base config copied from https://nextjs.org/docs/advanced-features/customizing-postcss-config#customizing-plugins
// NOTE: restored from the Next app's postcss.config.js. Two mechanical
// adaptations for the Astro/Vite toolchain, semantics unchanged:
//   - .cjs extension (package.json is "type": "module"; module.exports needs CJS)
//   - plugins as an object map instead of Next's string-array format: Vite's
//     bundled postcss-load-config only resolves plugin *names* in the object
//     form (array entries must already be plugin functions). Order and options
//     are identical to the original.
module.exports = {
    plugins: {
        'postcss-flexbugs-fixes': {},
        'postcss-nested': {},
        'postcss-normalize': {},
        'postcss-preset-env': {
            autoprefixer: {
                flexbox: 'no-2009',
            },
            stage: 3,
            features: {
                'custom-properties': false,
            },
        },
    },
}
