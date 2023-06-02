import {
    Html,
    Head,
    Main,
    NextScript,
} from 'next/document';

function Document() {
    return (
        <Html lang="en">
            <Head>
                <link
                    rel="shortcut icon"
                    href="/logo-compact.svg"
                />
                <link
                    rel="preconnect"
                    href="https://fonts.googleapis.com"
                />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    // crossorigin
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=Poppins:wght@300;400;700&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}

export default Document;
