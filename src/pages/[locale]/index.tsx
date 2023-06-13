import React from 'react';
import { GetStaticProps } from 'next';
import { useTranslation, SSRConfig } from 'next-i18next';
import { _cs } from '@togglecorp/fujs';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';

import Link from 'components/Link';
import InfoBox from 'components/InfoBox';
import Navbar from 'components/Navbar';
import Footer from 'components/Footer';
import Heading from 'components/Heading';

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
            <div
                className={styles.hero}
            >
                <div className={styles.background} />
                <section className={styles.section}>
                    <div className={styles.left}>
                        <Heading size="extraLarge">
                            {t('hero-title')}
                        </Heading>
                        <Heading
                            size="medium"
                            font="normal"
                        >
                            {t('hero-description')}
                        </Heading>
                        <div className={styles.buttonsContainer}>
                            <Link
                                href="https://togglecorp.com"
                                variant="button"
                                target="_blank"
                            >
                                {t('download-app-label')}
                            </Link>
                            <Link
                                href="/[locale]/get-involved"
                                variant="buttonTransparent"
                                target="_blank"
                            >
                                {t('get-involved-link')}
                            </Link>
                        </div>
                    </div>
                    <div className={styles.right}>
                        <div className={styles.screenshot}>
                            <Image
                                className={styles.image}
                                src="/screenshot.png"
                                alt="Mapswipe"
                                layout="fill"
                            />
                        </div>
                    </div>
                </section>
            </div>
            <section className={_cs(styles.mobilize, styles.section)}>
                <Heading className={styles.heading}>
                    {t('mobilizing-volunteer')}
                </Heading>
                <div className={styles.content}>
                    <div className={styles.pictures}>
                        Pictures go here
                    </div>
                    <div className={styles.descriptionContainer}>
                        <div>
                            {t('mobilizing-volunteer-description-paragraph-1')}
                        </div>
                        <div>
                            {t('mobilizing-volunteer-description-paragraph-2')}
                        </div>
                        <div className={styles.infoBoxContainer}>
                            <InfoBox
                                className={styles.infoBox}
                                value="100M"
                                label="Total Swipes"
                            />
                            <InfoBox
                                className={styles.infoBox}
                                value="70K"
                                label="Total Contributors"
                            />
                        </div>
                    </div>
                </div>
            </section>
            {/*
            <section className={_cs(styles.howMapswipeWorks, styles.section)}>
                <Heading className={styles.heading}>
                    {t('how-mapswipe-works')}
                </Heading>
                <div className={styles.content}>
                    Pictures go here
                </div>
            </section>
            */}
            <section className={_cs(styles.missionTypes, styles.section)}>
                <Heading className={styles.heading}>
                    {t('explore-mission-types')}
                    <Heading
                        font="normal"
                        className={styles.subHeading}
                        size="small"
                    >
                        {t('explore-mission-types-description')}
                    </Heading>
                </Heading>
                <div className={styles.content}>
                    Pictures go here
                </div>
            </section>
            <section className={_cs(styles.startMapswiping, styles.section)}>
                <Heading className={styles.heading}>
                    {t('start-mapswiping-title')}
                </Heading>
                <div className={styles.content}>
                    Pictures go here
                </div>
            </section>
            <section className={_cs(styles.recentNewsUpdates, styles.section)}>
                <Heading className={styles.heading}>
                    {t('recent-news-updates-title')}
                </Heading>
                <div className={styles.content}>
                    Pictures go here
                </div>
            </section>
            <section className={_cs(styles.partners, styles.section)}>
                <Heading className={styles.heading}>
                    {t('partners')}
                    <Heading
                        font="normal"
                        className={styles.subHeading}
                        size="small"
                    >
                        {t('partners-description')}
                    </Heading>
                </Heading>
                <div className={styles.content}>
                    Pictures go here
                </div>
            </section>
            <Footer />
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
