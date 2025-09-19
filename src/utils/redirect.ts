import { useEffect } from 'react';
import { useRouter } from 'next/router';
import i18nextConfig from '@/next-i18next.config';

import languageDetector from './languageDetector';

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

            const regex = new RegExp(`^/(${i18nextConfig.i18n.locales.join('|')})\\b`);

            if (to.match(regex)) {
                const newTo = to.replace(regex, `/${detectedLng}`);
                router.replace(newTo);
            } else {
                const newTo = `/${detectedLng}${to}`;
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
