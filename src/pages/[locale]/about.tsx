import { useEffect } from 'react';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/navigation';

import i18nextConfig from '../../../next-i18next.config';

// NOTE: Adding this to redirect to homepage

interface Props {}

function About() {
    const { replace } = useRouter();

    useEffect(() => {
        replace('/');
    }, [replace]);

    return (<div />);
}

export const getI18nPaths = () => (
    i18nextConfig.i18n.locales.map((lng) => ({
        params: {
            locale: lng,
        },
    }))
);

export const getStaticPaths = () => ({
    fallback: false,
    paths: getI18nPaths(),
});

export const getStaticProps: GetStaticProps<Props> = async () => ({
    props: { },
});

export default About;
