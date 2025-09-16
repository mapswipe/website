import { useEffect } from 'react';
import { appWithTranslation } from 'next-i18next';
import { Lato, DM_Sans } from 'next/font/google';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

import 'leaflet/dist/leaflet.css';
import 'styles/globals.css';
import 'styles/variables.css';

if (
    typeof window !== 'undefined'
    && process.env.NEXT_PUBLIC_POSTHOG_KEY
    && process.env.NEXT_PUBLIC_POSTHOG_HOST_API
) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST_API,
        // NOTE: Persistence in memory will not add any cookies
        persistence: 'memory',
        loaded: (loadedPosthog) => {
            if (process.env.NODE_ENV === 'development') {
                loadedPosthog.debug();
            }
        },
    });
}

const lato = Lato({
    weight: ['400', '700'],
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
    const router = useRouter();

    useEffect(() => {
        // Track page views
        const handleRouteChange = () => posthog?.capture('$pageview');
        router.events.on('routeChangeComplete', handleRouteChange);

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router]);

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
                    --font-family-lato: ${lato.style.fontFamily};
                    --font-family-dm-sans: ${dmSans.style.fontFamily};
                }
                `}
            </style>
                <PostHogProvider client={posthog}>
                    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                    <Component {...pageProps} />
                </PostHogProvider>
        </>
    );
}

export default appWithTranslation(MyApp);
