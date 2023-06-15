import React from 'react';
import { GetStaticProps } from 'next';
import { useTranslation, SSRConfig } from 'next-i18next';
import { _cs } from '@togglecorp/fujs';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';
import Head from 'next/head';
import { IoSearch } from 'react-icons/io5';

import Link from 'components/Link';
import InfoBox from 'components/InfoBox';
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
            <Head>
                <title>{`MapSwipe ${t('home')}`}</title>
            </Head>
            <div className={styles.hero}>
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
                <Heading
                    className={styles.heading}
                    size="large"
                >
                    {t('mobilizing-volunteer')}
                </Heading>
                <div className={styles.content}>
                    <div className={styles.pictures}>
                        <div className={_cs(styles.imageContainer, styles.single)}>
                            <Image
                                className={styles.image}
                                src="img/msf_mapping.jpg"
                                alt="Mapswipe"
                                layout="fill"
                            />
                        </div>
                        <div className={styles.images}>
                            <div className={_cs(styles.imageContainer, styles.double)}>
                                <Image
                                    className={styles.image}
                                    src="img/mapswipe_mapathon.jpg"
                                    alt="Mapswipe"
                                    layout="fill"
                                />
                            </div>
                            <div className={_cs(styles.imageContainer, styles.double)}>
                                <Image
                                    className={styles.image}
                                    src="img/field_mapping.jpg"
                                    alt="Mapswipe"
                                    layout="fill"
                                />
                            </div>
                        </div>
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
                                value="100M"
                                label="Total Swipes"
                            />
                            <InfoBox
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
                <Heading
                    className={styles.heading}
                    size="large"
                >
                    {t('explore-mission-types')}
                    <Heading
                        font="normal"
                        className={styles.subHeading}
                        size="extraSmall"
                    >
                        {t('explore-mission-types-description')}
                    </Heading>
                </Heading>
                <div className={styles.content}>
                    <div className={styles.missonType}>
                        <IoSearch
                            className={styles.icon}
                        />
                        <Heading
                            size="extraSmall"
                        >
                            {t('find-mission-type-heading')}
                        </Heading>
                        <div className={styles.missionTypeDescription}>
                            {t('find-mission-type-description')}
                        </div>
                    </div>
                </div>
            </section>
            <section className={_cs(styles.startMapswiping, styles.section)}>
                <Heading
                    className={styles.heading}
                    size="large"
                >
                    {t('start-mapswiping-title')}
                </Heading>
                <div className={styles.content}>
                    Pictures go here
                </div>
            </section>
            <section className={_cs(styles.recentNewsUpdates, styles.section)}>
                <Heading
                    className={styles.heading}
                    size="large"
                >
                    {t('recent-news-updates-title')}
                </Heading>
                <div className={styles.content}>
                    Pictures go here
                </div>
            </section>
            <section className={_cs(styles.partners, styles.section)}>
                <Heading
                    className={styles.heading}
                    size="large"
                >
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
