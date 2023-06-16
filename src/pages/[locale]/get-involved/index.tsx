import React from 'react';
import { GetStaticProps } from 'next';
import { useTranslation, SSRConfig } from 'next-i18next';
import { _cs } from '@togglecorp/fujs';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Hero from 'components/Hero';
import Button from 'components/Button';
import Link from 'components/Link';
import Section from 'components/Section';
import CenteredCard from 'components/CenteredCard';
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
        <div className={_cs(styles.getInvolved, className)}>
            <Hero
                className={styles.hero}
                title={t('hero-title')}
                description={t('hero-description')}
                rightContent={(
                    <ImageWrapper
                        className={styles.illustration}
                        src="/img/placeholder.png"
                        alt="Placeholder"
                    />
                )}
            />
            <Section
                title={t('contribute-now')}
                description={t('contribute-now-description')}
            />
            <Section
                title={t('individual-heading')}
                className={styles.individual}
                contentClassName={styles.content}
                smallHeading
            >
                <div className={styles.leftContainer}>
                    <ImageWrapper
                        className={styles.placeholder}
                        src="/img/placeholder.png"
                        alt="Placeholder"
                    />
                </div>
                <CenteredCard
                    title={t('looking-to-make-impact')}
                    description={t('looking-to-make-impact-description')}
                    actionsClassName={styles.linksContainer}
                    actions={(
                        <>
                            <div className={styles.buttonsContainer}>
                                <Link
                                    className={styles.buttonImageContainer}
                                    href="https://play.google.com/store/apps/details?id=org.missingmaps.mapswipe"
                                    target="_blank"
                                >
                                    <ImageWrapper
                                        imageClassName={styles.image}
                                        src="/img/playstore.png"
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
                                        src="/img/apple.png"
                                        alt="Download on Apple Store"
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
                        </>
                    )}
                />
                <CenteredCard
                    title={t('possess-technical-skills')}
                    description={t('possess-techincal-skills-description')}
                    actions={(
                        <Link
                            href="https://togglecorp.com"
                            variant="button"
                            target="_blank"
                        >
                            {t('volunteer-tech-suppport')}
                        </Link>
                    )}
                />
                <CenteredCard
                    className={styles.bottom}
                    title={t('possess-language-skills')}
                    description={t('possess-language-skills-description')}
                    actions={(
                        <Link
                            href="https://togglecorp.com"
                            variant="button"
                            target="_blank"
                        >
                            {t('volunteer-tech-suppport')}
                        </Link>
                    )}
                />
            </Section>
            <Section
                title={t('group-heading')}
                className={styles.group}
                contentClassName={styles.content}
                smallHeading
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
                                href="https://togglecorp.com"
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
                                href="https://togglecorp.com"
                                variant="button"
                                target="_blank"
                            >
                                {t('register-your-interest')}
                            </Link>
                        )}
                    />
                </div>
                <div className={styles.imageContainer}>
                    <ImageWrapper
                        className={styles.placeholder}
                        src="/img/placeholder.png"
                        alt="Placeholder"
                    />
                </div>
            </Section>
            <Section
                title={t('organization-heading')}
                className={styles.organizational}
                contentClassName={styles.content}
                smallHeading
            >
                <div className={styles.imageContainer}>
                    <ImageWrapper
                        className={styles.placeholder}
                        src="/img/placeholder.png"
                        alt="Placeholder"
                    />
                </div>
                <CenteredCard
                    className={styles.card}
                    title={t('humanitarian-or-nonprofit')}
                    description={t('humanitarian-or-nonprofit-description')}
                    actions={(
                        <Link
                            className={styles.downloadLink}
                            href="https://togglecorp.com"
                            variant="button"
                            target="_blank"
                        >
                            {t('tell-us-more')}
                        </Link>
                    )}
                />
            </Section>
            <Section
                title={t('donate-heading')}
                className={styles.donate}
                contentClassName={styles.content}
                smallHeading
                withAlternativeBackground
            >
                <CenteredCard
                    className={styles.card}
                    title={t('interested-in-supporting')}
                    description={t('interested-in-supporting-description')}
                    actions={(
                        <Link
                            className={styles.downloadLink}
                            href="https://togglecorp.com"
                            variant="button"
                            target="_blank"
                        >
                            {t('donate-now')}
                        </Link>
                    )}
                />
                <div className={styles.imageContainer}>
                    <ImageWrapper
                        className={styles.placeholder}
                        src="/img/placeholder.png"
                        alt="Placeholder"
                    />
                </div>
            </Section>
            <Section
                title={t('contact-section-heading')}
                description={t('contact-section-description')}
                actions={(
                    <Button>
                        {t('contact-link-label')}
                    </Button>
                )}
            />
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
