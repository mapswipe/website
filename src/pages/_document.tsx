import Document, {
    Html,
    Head,
    Main,
    NextScript,
} from 'next/document';

import i18nextConfig from '../../next-i18next.config';

class MyDocument extends Document {
    render() {
        // eslint-disable-next-line no-underscore-dangle
        let currentLocale = this.props.__NEXT_DATA__.query.locale
            ?? i18nextConfig.i18n.defaultLocale;
        if (Array.isArray(currentLocale)) {
            [currentLocale] = currentLocale;
        }
        const buildDate = process.env.MAPSWIPE_BUILD_DATE;

        return (
            <Html lang={currentLocale}>
                <Head>
                    <link
                        rel="shortcut icon"
                        href="/logo-compact.svg"
                    />
                    <meta property="og:title" content="MapSwipe" />
                    <meta property="twitter:title" content="MapSwipe" />
                    <meta property="og:type" content="website" />
                    <meta property="og:description" content="Volunteer from your phone. Make a difference worldwide." />
                    <meta property="og:image" content="/ms-website.png" />
                    <meta property="og:updated_time" content={buildDate ?? '1691561444886'} />

                    <meta property="twitter:description" content="Volunteer from your phone. Make a difference worldwide." />
                    <meta property="og:image" content="/ms-website.png" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
