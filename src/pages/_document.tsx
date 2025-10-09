import Document, {
    Html,
    Head,
    Main,
    NextScript,
} from 'next/document';

import i18nextConfig from '@/next-i18next.config';

class MyDocument extends Document {
    render() {
        // eslint-disable-next-line no-underscore-dangle
        let currentLocale = this.props.__NEXT_DATA__.query.locale
            ?? i18nextConfig.i18n.defaultLocale;
        if (Array.isArray(currentLocale)) {
            [currentLocale] = currentLocale;
        }

        return (
            <Html lang={currentLocale}>
                <Head>
                    <link
                        rel="shortcut icon"
                        href="/logo-compact.svg"
                    />
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
