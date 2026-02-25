import React from 'react';
import { GetStaticProps } from 'next';
import { useTranslation, SSRConfig } from 'next-i18next';
import { _cs } from '@togglecorp/fujs';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import OgMeta from 'components/OgMeta';
import Page from 'components/Page';
import Hero from 'components/Hero';
import Heading from 'components/Heading';
import Link from 'components/Link';
import Section from 'components/Section';
import CenteredCard from 'components/CenteredCard';
import ImageWrapper from 'components/ImageWrapper';

import i18nextConfig from '@/next-i18next.config';

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
        <Page contentClassName={_cs(styles.getInvolved, className)}>
            <OgMeta
                title={String(t('get-involved-tab-head'))}
            />
            <Hero
                className={styles.hero}
                title={t('hero-title')}
                description={t('hero-description')}
                rightContent={(
                    <ImageWrapper
                        className={styles.illustration}
                        src="/img/get-involved-banner.svg"
                        alt={t('get-involved-banner')}
                    />
                )}
            />
            <Section
                title={t('contribute-now')}
                description={t('contribute-now-description')}
                containerClassName={styles.contributeContainer}
                contentClassName={styles.contributeSection}
            >
                <div className={styles.buttonsContainer}>
                    <Link
                        className={styles.buttonImageContainer}
                        href="https://play.google.com/store/apps/details?id=org.missingmaps.mapswipe"
                        target="_blank"
                    >
                        <ImageWrapper
                            imageClassName={styles.image}
                            src="/img/playstore.png"
                            alt={t('download-on-playstore')}
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
                            alt={t('download-on-apple-store')}
                        />
                    </Link>
                </div>
                <div className={styles.linkContainer}>
                    <Link
                        className={styles.downloadLink}
                        href="https://web.mapswipe.org/"
                        target="_blank"
                    >
                        {t('use-web-app-label')}
                    </Link>
                    |
                    <Link
                        className={styles.downloadLink}
                        href="https://github.com/mapswipe/mapswipe/releases/latest/download/app-production-release.apk"
                        target="_blank"
                    >
                        {t('download-apk-label')}
                    </Link>
                </div>
            </Section>
            <Section
                sectionId="individual"
                className={styles.individual}
                contentClassName={styles.content}
                containerClassName={styles.sectionContainer}
            >
                <div className={styles.imageContainer}>
                    <Heading size="medium">
                        {t('individual-heading')}
                    </Heading>
                    <ImageWrapper
                        className={styles.illustration}
                        src="/img/individual.svg"
                        alt={t('individual-heading-image')}
                    />
                </div>
                <div className={styles.cards}>
                    <CenteredCard
                        title={t('possess-language-skills')}
                        description={t('possess-language-skills-description')}
                        actions={(
                            <Link
                                href="https://explore.transifex.com/mapswipe/"
                                variant="button"
                                target="_blank"
                            >
                                {t('contribute-on-transifex')}
                            </Link>
                        )}
                    />
                    <CenteredCard
                        title={t('possess-technical-skills')}
                        description={t('possess-techincal-skills-description')}
                        actions={(
                            <Link
                                href="https://github.com/mapswipe/"
                                variant="button"
                                target="_blank"
                            >
                                {t('contribute-on-github')}
                            </Link>
                        )}
                    />
                </div>
            </Section>
            <Section
                className={styles.group}
                containerClassName={styles.sectionContainer}
                contentClassName={styles.content}
                withAlternativeBackground
            >
                <div className={styles.cards}>
                    <CenteredCard
                        className={styles.card}
                        title={t('want-to-host-mapswipe-events')}
                        description={t('want-to-host-mapswipe-events-description')}
                        actions={(
                            <Link
                                className={styles.downloadLink}
                                href="https://drive.google.com/drive/folders/1j5XnyqI_LKYBCg9oJaaWIKbsBxwB8Cld?usp=drive_link"
                                variant="button"
                                target="_blank"
                            >
                                {t('download-toolkit')}
                            </Link>
                        )}
                    />
                    <CenteredCard
                        className={styles.card}
                        title={t('engage-your-csr')}
                        description={t('engage-your-csr-description')}
                        actions={(
                            <Link
                                className={styles.downloadLink}
                                href="https://docs.google.com/forms/d/e/1FAIpQLSf_05ZvC4i7HfDgYqedvsPxG66o8SHMaKs1GpnLC9KVFa4FuQ/viewform?usp=sf_link"
                                variant="button"
                                target="_blank"
                            >
                                {t('register-your-interest')}
                            </Link>
                        )}
                    />
                </div>
                <div className={styles.imageContainer}>
                    <Heading size="medium">
                        {t('group-heading')}
                    </Heading>
                    <ImageWrapper
                        className={styles.illustration}
                        src="/img/group.svg"
                        alt={t('group-heading-image')}
                    />
                </div>
            </Section>
            <Section
                containerClassName={styles.sectionContainer}
                className={styles.organizational}
                contentClassName={styles.content}
            >
                <div className={styles.imageContainer}>
                    <Heading size="medium">
                        {t('organization-heading')}
                    </Heading>
                    <ImageWrapper
                        className={styles.illustration}
                        src="/img/organization.svg"
                        alt={t('organization-logo')}
                    />
                </div>
                <CenteredCard
                    className={styles.card}
                    title={t('humanitarian-or-nonprofit')}
                    description={t('humanitarian-or-nonprofit-description')}
                    actions={(
                        <Link
                            className={styles.downloadLink}
                            href="https://docs.google.com/forms/d/e/1FAIpQLSetcSda6EyuvOXMUPe7Gw7wNNIdR9R9RlvOi1j9Zu-C3ZXtbg/viewform?usp=sf_link"
                            variant="button"
                            target="_blank"
                        >
                            {t('tell-us-more')}
                        </Link>
                    )}
                />
            </Section>
            <Section
                className={styles.donate}
                contentClassName={styles.content}
                containerClassName={styles.sectionContainer}
                withAlternativeBackground
            >
                <CenteredCard
                    className={styles.card}
                    title={t('interested-in-supporting')}
                    description={(
                        <div className={styles.donateCardDescription}>
                            <p>
                                {t('interested-in-supporting-description-1')}
                            </p>
                            <Link
                                href="https://github.com/user-attachments/files/18838540/MapSwipe.2024.Financial.Report.pdf"
                                variant="underline"
                                target="_blank"
                            >
                                {t('download-financial-report')}
                            </Link>
                        </div>
                    )}
                    actions={(
                        <Link
                            className={styles.downloadLink}
                            href="https://opencollective.com/mapswipe"
                            variant="button"
                            target="_blank"
                        >
                            {t('donate-now')}
                        </Link>
                    )}
                />
                <div className={styles.imageContainer}>
                    <Heading size="medium">
                        {t('donate-heading')}
                    </Heading>
                    <ImageWrapper
                        className={styles.illustration}
                        src="/img/donate.svg"
                        alt={t('donation-logo')}
                    />
                </div>
            </Section>
            <Section
                title={t('contact-section-heading')}
                description={t('contact-section-description')}
                actions={(
                    <Link
                        href="mailto:info@mapswipe.org"
                        variant="button"
                        target="_blank"
                    >
                        {t('contact-link-label')}
                    </Link>
                )}
            />
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
