import React from 'react';
import { GetStaticProps } from 'next';
import { useTranslation, SSRConfig } from 'next-i18next';
import { _cs } from '@togglecorp/fujs';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Hero from 'components/Hero';
import Section from 'components/Section';
import ImageWrapper from 'components/ImageWrapper';

import i18nextConfig from '../../../../next-i18next.config';

import styles from './styles.module.css';

interface Props extends SSRConfig {
    className?: string;
}

function GetInvolved(props: Props) {
    const {
        className,
    } = props;

    const { t } = useTranslation('get-involved');

    return (
        <div
            className={_cs(styles.getInvolved, className)}
        >
            <Hero
                className={styles.hero}
                title={t('hero-title')}
                description={t('hero-description')}
                rightContent={(
                    <ImageWrapper
                        className={styles.screenshot}
                        imageClassName={styles.image}
                        src="/img/placeholder.png"
                        alt="Placeholder"
                    />
                )}
            />
            <Section
                title={t('mobilizing-volunteer')}
            >
                <div className={styles.leftContainer}>
                    Individual
                </div>
            </Section>
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
        'get-involved',
        'common',
    ]);
    return {
        props: {
            ...translations,
        },
    };
};

export default GetInvolved;
