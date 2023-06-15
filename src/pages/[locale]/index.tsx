import React from 'react';
import { GetStaticProps } from 'next';
import { useTranslation, SSRConfig } from 'next-i18next';
import { _cs } from '@togglecorp/fujs';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';
import Head from 'next/head';
import { IoSearch } from 'react-icons/io5';

import Link from 'components/Link';
import ImageWrapper from 'components/ImageWrapper';
import InfoBox from 'components/InfoBox';
import Heading from 'components/Heading';

import i18nextConfig from '../../../next-i18next.config';

import styles from './styles.module.css';

const partners = [
    {
        altText: 'American Red Cross Logo',
        imageSrc: 'img/arc.png',
        link: 'https://www.redcross.org/',
    },
    {
        altText: 'British Red Cross Logo',
        imageSrc: 'img/brc.svg',
        link: 'https://www.redcross.org.uk/',
    },
    {
        altText: 'HeiGIT logo',
        imageSrc: 'img/heigit.png',
        link: 'https://heigit.org/',
    },
    {
        altText: 'HOT logo',
        imageSrc: 'img/hot.png',
        link: 'https://www.hotosm.org/',
    },
    {
        altText: 'MSF logo',
        imageSrc: 'img/msf.png',
        link: 'https://msf.org.uk/',
    },
    {
        altText: 'Togglecorp logo',
        imageSrc: 'img/tc.png',
        link: 'https://togglecorp.com',
    },
];

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
                                href="/[locale]/data"
                                variant="buttonTransparent"
                                target="_blank"
                            >
                                {t('data-link')}
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
                        <div className={styles.description}>
                            {t('mobilizing-volunteer-description-paragraph-1')}
                        </div>
                        <div className={styles.description}>
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
                <div className={styles.headingContainer}>
                    <Heading
                        className={styles.heading}
                        size="large"
                    >
                        {t('explore-mission-types')}
                    </Heading>
                    <Heading
                        font="normal"
                        className={styles.subHeading}
                        size="small"
                    >
                        {t('explore-mission-types-description')}
                    </Heading>
                </div>
                <div className={styles.content}>
                    <div className={styles.missionType}>
                        <IoSearch
                            className={styles.icon}
                        />
                        <Heading>
                            {t('find-mission-type-heading')}
                        </Heading>
                        <div className={styles.missionTypeDescription}>
                            {t('find-mission-type-description')}
                        </div>
                    </div>
                    <div className={styles.missionType}>
                        <IoSearch
                            className={styles.icon}
                        />
                        <Heading>
                            {t('compare-mission-type-heading')}
                        </Heading>
                        <div className={styles.missionTypeDescription}>
                            {t('compare-mission-type-description')}
                        </div>
                    </div>
                    <div className={styles.missionType}>
                        <IoSearch
                            className={styles.icon}
                        />
                        <Heading>
                            {t('validate-mission-type-heading')}
                        </Heading>
                        <div className={styles.missionTypeDescription}>
                            {t('validate-mission-type-description')}
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
                    <div className={styles.download}>
                        <div className={styles.description}>
                            {t('download-description')}
                        </div>
                        <div className={styles.linksContainer}>
                            <div className={styles.buttonsContainer}>
                                <Link
                                    className={styles.buttonImageContainer}
                                    href="https://play.google.com/store/apps/details?id=org.missingmaps.mapswipe"
                                    target="_blank"
                                >
                                    <Image
                                        className={styles.image}
                                        src="img/playstore.png"
                                        alt="Download on playstore"
                                        layout="fill"
                                    />
                                </Link>
                                <Link
                                    className={styles.buttonImageContainer}
                                    href="https://apps.apple.com/us/app/mapswipe/id1133855392?ls=1"
                                    target="_blank"
                                >
                                    <Image
                                        className={styles.image}
                                        src="img/apple.png"
                                        alt="Download on Apple Store"
                                        layout="fill"
                                    />
                                </Link>
                            </div>
                            <Link
                                className={styles.downloadLink}
                                href="https://togglecorp.com"
                                target="_blank"
                            >
                                {t('download-apk-label')}
                            </Link>
                        </div>
                    </div>
                    <div className={styles.getInvolved}>
                        <div className={styles.description}>
                            {t('get-involved-description')}
                        </div>
                        <Link
                            variant="button"
                            href="/[locale]/get-involved"
                        >
                            {t('get-involved-link')}
                        </Link>
                    </div>
                </div>
            </section>
            {/*
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
            */}
            <section className={_cs(styles.partners, styles.section)}>
                <Heading
                    className={styles.heading}
                    size="large"
                >
                    {t('partners')}
                </Heading>
                <div className={styles.content}>
                    <Link
                        href="https://www.missingmaps.org/"
                        target="_blank"
                    >
                        <ImageWrapper
                            className={styles.missingMapsLogo}
                            src="img/missingmaps.png"
                            alt="Missing Maps Logo"
                            layout="fill"
                        />
                    </Link>
                    <div className={styles.description}>
                        {t('missing-map-description')}
                    </div>
                    <div className={styles.partnerLogos}>
                        {partners.map((partner) => (
                            <Link
                                key={partner.link}
                                href={partner.link}
                                target="_blank"
                            >
                                <ImageWrapper
                                    className={styles.partnerLogo}
                                    src={partner.imageSrc}
                                    alt={partner.altText}
                                    layout="fill"
                                />
                            </Link>
                        ))}
                    </div>
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
