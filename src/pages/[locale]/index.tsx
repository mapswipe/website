import React from 'react';
import { GetStaticProps } from 'next';
import { useTranslation, SSRConfig } from 'next-i18next';
import {
    _cs,
    compareDate,
} from '@togglecorp/fujs';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import {
    gql,
    request,
} from 'graphql-request';
import Head from 'next/head';
import {
    IoCalendarClearOutline,
    IoArrowForwardSharp,
} from 'react-icons/io5';

import Page from 'components/Page';
import Link from 'components/Link';
import {
    graphqlEndpoint,
    Stats,
} from 'utils/common';
import ProjectTypeIcon from 'components/ProjectTypeIcon';
import Tag from 'components/Tag';
import ImageWrapper from 'components/ImageWrapper';
import KeyFigure from 'components/KeyFigure';
import Card from 'components/Card';
import Hero from 'components/Hero';
import NumberOutput from 'components/NumberOutput';
import Section from 'components/Section';
import getBlogs, { Blog } from 'utils/requests/getBlogs';

import i18nextConfig from '../../../next-i18next.config';

import styles from './styles.module.css';

const partners = [
    {
        altText: 'American Red Cross Logo',
        imageSrc: '/img/arc.svg',
        link: 'https://www.redcross.org/',
    },
    {
        altText: 'British Red Cross Logo',
        imageSrc: '/img/brc.svg',
        link: 'https://www.redcross.org.uk/',
    },
    {
        altText: 'Canadian Red Cross Logo',
        imageSrc: '/img/crc.svg',
        link: 'https://www.redcross.ca/',
    },
    {
        altText: 'HeiGIT logo',
        imageSrc: '/img/heigit.png',
        link: 'https://heigit.org/',
    },
    {
        altText: 'HOT logo',
        imageSrc: '/img/hot.png',
        link: 'https://www.hotosm.org/',
    },
    {
        altText: 'MSF logo',
        imageSrc: '/img/msf.png',
        link: 'https://msf.org.uk/',
    },
    {
        altText: 'Togglecorp logo',
        imageSrc: '/img/tc.png',
        link: 'https://togglecorp.com',
    },
];

interface Props extends SSRConfig {
    className?: string;
    totalContributors?: number | null | undefined;
    totalSwipes?: number | null | undefined;
    featuredBlogs: Omit<Blog, 'markdownContent'>[];
}

function Home(props: Props) {
    const {
        className,
        totalContributors,
        totalSwipes,
        featuredBlogs,
    } = props;

    const { t } = useTranslation('home');

    return (
        <Page contentClassName={_cs(styles.home, className)}>
            <Head>
                <title>{t('home-tab-head')}</title>
                <meta property="og:title" content={String(t('home-tab-head'))} />
                <meta property="twitter:title" content={String(t('home-tab-head'))} />
            </Head>
            <Hero
                className={styles.hero}
                title={t('hero-title')}
                description={t('hero-description')}
                rightContent={(
                    <video
                        className={styles.screenshot}
                        autoPlay
                        loop
                        muted
                        playsInline
                    >
                        <source src="/img/animation.mp4" type="video/mp4" />
                    </video>
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
                        src="/img/msf_mapping.jpg"
                        alt={t('mobilize-volunteer')}
                    />
                    <div className={styles.images}>
                        <ImageWrapper
                            className={_cs(styles.imageContainer, styles.double)}
                            imageClassName={styles.image}
                            src="/img/mapswipe_mapathon.jpg"
                            alt={t('mapathon')}
                            fill
                        />
                        <ImageWrapper
                            className={_cs(styles.imageContainer, styles.double)}
                            imageClassName={styles.image}
                            src="/img/field_mapping.jpg"
                            alt={t('field-mapping')}
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
                            label={t('total-swipes')}
                        />
                        <KeyFigure
                            value={(
                                <NumberOutput
                                    value={totalContributors}
                                />
                            )}
                            label={t('total-contributors')}
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
                    imageClassName={_cs(styles.missionImage, styles.beforeAfterContainer)}
                    coverImageContent={(
                        <>
                            <ImageWrapper
                                imageClassName={styles.beforeImage}
                                className={styles.beforeAfterImageWrapper}
                                src="/img/before.svg"
                                alt="before-image"
                            />
                            <ImageWrapper
                                imageClassName={styles.afterImage}
                                className={styles.beforeAfterImageWrapper}
                                src="/img/after.svg"
                                alt="after-image"
                            />
                        </>
                    )}
                    heading={t('type-compare-title')}
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
                    <div className={styles.startMapswipingDescription}>
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
                                    src="/img/playstore.png"
                                    alt={t('download-playstore')}
                                />
                            </Link>
                            <Link
                                className={styles.buttonImageContainer}
                                href="https://apps.apple.com/us/app/mapswipe/id1133855392?ls=1"
                                target="_blank"
                            >
                                <ImageWrapper
                                    imageClassName={styles.image}
                                    src="/img/apple.png"
                                    alt={t('download-apple-store')}
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
                    <div className={styles.startMapswipingDescription}>
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
                className={styles.recentNewsAndUpdates}
                title={t('news-and-updates-title')}
                contentClassName={styles.content}
            >
                {featuredBlogs.map((blog, index) => (
                    <Card
                        className={_cs(
                            styles.blogItem,
                            index === 0 && styles.firstGrid,
                        )}
                        key={blog.name}
                        description={(
                            <Tag
                                className={styles.tag}
                                icon={<IoCalendarClearOutline />}
                                variant="transparent"
                            >
                                {t('date', { date: blog.publishedDate })}
                            </Tag>
                        )}
                        heading={blog.title}
                        coverImageUrl={blog.coverImage}
                        childrenContainerClassName={styles.cardContent}
                        coverImageOnSide={index !== 0}
                        borderless
                    >
                        <div className={styles.blogDescription}>{blog.description}</div>
                        <Link
                            className={styles.link}
                            href={`/[locale]/blogs/${blog.name}`}
                        >
                            {t('read-more')}
                        </Link>
                    </Card>
                ))}
                <div className={styles.sectionDescription}>
                    <Link
                        className={styles.seeMoreLink}
                        href="/[locale]/blogs"
                    >
                        {t('see-more-pages')}
                        <IoArrowForwardSharp />
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
                        src="/img/missingmaps.png"
                        alt={t('missing-maps')}
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
    const blogs = await getBlogs();

    const featuredBlogs = blogs
        .filter((blog) => blog.featured)
        .slice(0, 3)
        .map((blog) => ({
            name: blog.name,
            title: blog.title,
            publishedDate: blog.publishedDate,
            description: blog.description,
            author: blog.author,
            coverImage: blog.coverImage,
            featured: blog.featured,
        }));

    const sortedBlogs = [...featuredBlogs]
        .sort((foo, bar) => compareDate(foo.publishedDate, bar.publishedDate, -1));

    return {
        props: {
            ...translations,
            totalContributors: value.communityStats?.totalContributors,
            totalSwipes: value.communityStats?.totalSwipes,
            featuredBlogs: sortedBlogs,
        },
    };
};

export default Home;
