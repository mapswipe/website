import { useEffect } from 'react';
import { useRouter } from 'next/router';
import languageDetector from './languageDetector';

import i18nextConfig from '../../next-i18next.config';

export function useRedirect(toFromProps?: string) {
    const router = useRouter();
    const to = toFromProps ?? router.asPath;

    useEffect(
        () => {
            const detectedLng = languageDetector.detect();
            if (!detectedLng) {
                return;
            }

            if (languageDetector.cache) {
                languageDetector.cache(detectedLng);
            }

            const matchedLocale = i18nextConfig.i18n.locales.find(
                (locale) => to.startsWith(`/${locale}\b`),
            );

            if (matchedLocale) {
                const newTo = to.replace(matchedLocale, detectedLng);
                console.warn(matchedLocale, to, newTo);
                router.replace(newTo);
            } else {
                const newTo = `/${detectedLng}${to}`;
                console.warn(undefined, to, newTo);
                router.replace(newTo);
            }
        },
        [router, to],
    );
}

export function Redirect() {
    useRedirect();
    return null;
}
