import React from 'react';
import { GetStaticProps } from 'next';
import { useTranslation, SSRConfig } from 'next-i18next';
import { _cs } from '@togglecorp/fujs';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Navbar from 'components/Navbar';

import i18nextConfig from '../../../next-i18next.config';

import styles from './styles.module.css';

interface Props extends SSRConfig {
    className?: string;
}

function Home(props: Props) {
    const {
        className,
    } = props;

    const { t } = useTranslation('home');

    return (
        <div
            className={_cs(styles.home, className)}
        >
            <Navbar />
            <div>
                {t('page-content')}
            </div>
        </div>
    );
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

export const getStaticProps: GetStaticProps<Props> = async (context) => {
    const locale = context?.params?.locale;
    const translations = await serverSideTranslations(locale as string, [
        'home',
        'common',
    ]);
    return {
        props: {
            ...translations,
        },
    };
};

export default Home;
