import { useEffect } from 'react';
import { useRouter } from 'next/router';
import languageDetector from './languageDetector';

export function useRedirect(toFromProps?: string) {
    const router = useRouter();
    const to = toFromProps ?? router.asPath;

    useEffect(() => {
        const detectedLng = languageDetector.detect();
        if (!detectedLng) {
            return;
        }

        if (languageDetector.cache) {
            languageDetector.cache(detectedLng);
        }
        router.replace(`/${detectedLng}${to}`);
    });
}

export function Redirect() {
    useRedirect();
    return null;
}
