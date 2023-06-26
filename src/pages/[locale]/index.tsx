import React from 'react';
import { GetStaticProps } from 'next';
import { useTranslation, SSRConfig } from 'next-i18next';
import { _cs } from '@togglecorp/fujs';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
    gql,
    request,
} from 'graphql-request';
import Head from 'next/head';

import Page from 'components/Page';
import Link from 'components/Link';
import {
    graphqlEndpoint,
    Stats,
} from 'utils/common';
import ProjectTypeIcon from 'components/ProjectTypeIcon';
import ImageWrapper from 'components/ImageWrapper';
import KeyFigure from 'components/KeyFigure';
import Card from 'components/Card';
import Hero from 'components/Hero';
import NumberOutput from 'components/NumberOutput';
import Section from 'components/Section';

import i18nextConfig from '../../../next-i18next.config';

import styles from './styles.module.css';

const partners = [
    {
        altText: 'American Red Cross Logo',
        imageSrc: 'img/arc.svg',
        link: 'https://www.redcross.org/',
    },
    {
        altText: 'British Red Cross Logo',
        imageSrc: 'img/brc.svg',
        link: 'https://www.redcross.org.uk/',
    },
    {
        altText: 'Canadian Red Cross Logo',
        imageSrc: 'img/crc.svg',
        link: 'https://www.redcross.ca/',
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
    totalContributors?: number | null | undefined;
    totalSwipes?: number | null | undefined;
}

function Home(props: Props) {
    const {
        className,
        totalContributors,
        totalSwipes,
    } = props;

    const { t } = useTranslation('home');

    return (
        <Page contentClassName={_cs(styles.home, className)}>
            <Head>
                <title>{t('home-tab-head')}</title>
            </Head>
            <Hero
                className={styles.hero}
                title={t('hero-title')}
                description={t('hero-description')}
                rightContent={(
                    <ImageWrapper
                        className={styles.screenshot}
                        imageClassName={styles.image}
                        src="/img/banner.png"
                        alt="Mapswipe"
                    />
                )}
                actions={(
                    <>
                        <Link
                            href="#startMapswiping"
                            variant="button"
                        >
                            {t('download-app-label')}
                        </Link>
                        <Link
                            href="/[locale]/data"
                            variant="buttonTransparent"
                        >
                            {t('data-link')}
                        </Link>
                    </>
                )}
            />
            <Section
                title={t('mobilizing-volunteer')}
                className={styles.mobilize}
                contentClassName={styles.content}
            >
                <div className={styles.pictures}>
                    <ImageWrapper
                        className={_cs(styles.imageContainer, styles.single)}
                        imageClassName={styles.image}
                        src="img/msf_mapping.jpg"
                        alt="Mapswipe"
                    />
                    <div className={styles.images}>
                        <ImageWrapper
                            className={_cs(styles.imageContainer, styles.double)}
                            imageClassName={styles.image}
                            src="img/mapswipe_mapathon.jpg"
                            alt="Mapswipe"
                            fill
                        />
                        <ImageWrapper
                            className={_cs(styles.imageContainer, styles.double)}
                            imageClassName={styles.image}
                            src="img/field_mapping.jpg"
                            alt="Mapswipe"
                        />
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
                        <KeyFigure
                            value={(
                                <NumberOutput
                                    value={totalSwipes}
                                    normal
                                />
                            )}
                            label="Total Swipes"
                        />
                        <KeyFigure
                            value={(
                                <NumberOutput
                                    value={totalContributors}
                                />
                            )}
                            label="Total Contributors"
                        />
                    </div>
                </div>
            </Section>
            <Section
                className={styles.missionTypes}
                title={t('explore-mission-types')}
                description={t('explore-mission-types-description')}
                contentClassName={styles.content}
            >
                <Card
                    className={styles.missionType}
                    coverImageUrl="/img/find.svg"
                    heading={t('type-find-title')}
                    imageClassName={styles.missionImage}
                    icons={(
                        <ProjectTypeIcon
                            type="1"
                        />
                    )}
                >
                    {t('find-mission-type-description')}
                </Card>
                <Card
                    className={styles.missionType}
                    coverImageUrl="/img/compare.svg"
                    heading={t('type-compare-title')}
                    imageClassName={styles.missionImage}
                    icons={(
                        <ProjectTypeIcon
                            type="3"
                        />
                    )}
                >
                    {t('compare-mission-type-description')}
                </Card>
                <Card
                    className={styles.missionType}
                    imageClassName={styles.missionImage}
                    coverImageUrl="/img/validate.svg"
                    heading={t('type-validate-title')}
                    icons={(
                        <ProjectTypeIcon
                            type="2"
                        />
                    )}
                >
                    {t('validate-mission-type-description')}
                </Card>
            </Section>
            <Section
                sectionId="startMapswiping"
                className={styles.startMapswiping}
                title={t('start-mapswiping-title')}
                contentClassName={styles.content}
            >
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
                                <ImageWrapper
                                    imageClassName={styles.image}
                                    src="img/playstore.png"
                                    alt="Download on playstore"
                                />
                            </Link>
                            <Link
                                className={styles.buttonImageContainer}
                                href="https://apps.apple.com/us/app/mapswipe/id1133855392?ls=1"
                                target="_blank"
                            >
                                <ImageWrapper
                                    imageClassName={styles.image}
                                    src="img/apple.png"
                                    alt="Download on Apple Store"
                                />
                            </Link>
                        </div>
                        <Link
                            className={styles.downloadLink}
                            href="https://github.com/mapswipe/mapswipe/releases/latest/download/app-production-release.apk"
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
            </Section>
            <Section
                className={styles.partners}
                title={t('partners')}
                contentClassName={styles.content}
            >
                <Link
                    href="https://www.missingmaps.org/"
                    target="_blank"
                >
                    <ImageWrapper
                        className={styles.missingMapsLogo}
                        src="img/missingmaps.png"
                        alt="Missing Maps Logo"
                    />
                </Link>
                <div className={styles.partnersDescription}>
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
                            />
                        </Link>
                    ))}
                </div>
            </Section>
        </Page>
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
    const stats = gql`
        query CommunityStats {
            communityStats {
                totalContributors
                totalUserGroups
                totalSwipes
            }
        }
    `;
    const value: Stats = await request(graphqlEndpoint, stats);

    const {
        totalContributors,
        totalSwipes,
    } = value?.communityStats ?? {};

    return {
        props: {
            ...translations,
            totalContributors,
            totalSwipes,
        },
    };
};

export default Home;
