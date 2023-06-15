import { appWithTranslation } from 'next-i18next';
import { Poppins, DM_Sans } from 'next/font/google';
import Navbar from 'components/Navbar';
import Footer from 'components/Footer';

import 'leaflet/dist/leaflet.css';
import 'styles/globals.css';
import 'styles/variables.css';

import type { AppProps } from 'next/app';

const poppins = Poppins({
    weight: ['300', '400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
});
const dmSans = DM_Sans({
    weight: ['400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
});

function MyApp(props: AppProps) {
    const {
        Component,
        pageProps,
    } = props;

    return (
        <>
            <style
                // eslint-disable-next-line react/no-unknown-property
                jsx
                // eslint-disable-next-line react/no-unknown-property
                global
            >
                {`
                :root {
                    --font-family-poppins: ${poppins.style.fontFamily};
                    --font-family-dm-sans: ${dmSans.style.fontFamily};
                }
                `}
            </style>
            <Navbar />
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <Component {...pageProps} />
            <Footer />
        </>
    );
}

export default appWithTranslation(MyApp);
