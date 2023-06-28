import React from 'react';
import { useTranslation } from 'next-i18next';
import {
    _cs,
} from '@togglecorp/fujs';
import Link from 'components/Link';
import { FaRegNewspaper } from 'react-icons/fa';
import {
    IoLogoSlack,
    IoLogoFacebook,
    IoLogoTwitter,
    IoLogoGithub,
    IoMail,
    IoLogoInstagram,
} from 'react-icons/io5';

import Heading from 'components/Heading';

import styles from './styles.module.css';

export interface Props {
    className?: string;
}

function Footer(props: Props) {
    const {
        className,
    } = props;

    const { t } = useTranslation('common');

    return (
        <div className={_cs(className, styles.footer)}>
            <div className={styles.topContainer}>
                <div className={styles.section}>
                    <Heading
                        className={styles.heading}
                        size="small"
                    >
                        {t('footer-about-us-title')}
                    </Heading>
                    <div>
                        {t('footer-about-us-description')}
                    </div>
                </div>
                <div className={_cs(styles.section, styles.midSection)}>
                    <Heading
                        className={styles.heading}
                        size="small"
                    >
                        {t('footer-quick-links')}
                    </Heading>
                    <div className={styles.links}>
                        <Link
                            href="/[locale]/"
                        >
                            {t('home-link')}
                        </Link>
                        <Link
                            href="/[locale]/get-involved"
                        >
                            {t('get-involved-link')}
                        </Link>
                        <Link
                            href="/[locale]/data"
                        >
                            {t('data-link')}
                        </Link>
                        <Link
                            href="/[locale]/blogs"
                        >
                            {t('blogs-link')}
                        </Link>
                        <Link
                            href="https://community.mapswipe.org/"
                        >
                            {t('community-dashboard-link')}
                        </Link>
                    </div>
                </div>
                <div className={styles.section}>
                    <Heading
                        className={styles.heading}
                        size="small"
                    >
                        {t('footer-follow-us-title')}
                    </Heading>
                    <div className={styles.socialLinks}>
                        <Link
                            href="https://www.facebook.com/TheMissingMaps"
                            variant="icon"
                            target="_blank"
                            title={t('facebook')}
                        >
                            <IoLogoFacebook />
                        </Link>
                        <Link
                            href="https://twitter.com/mapswipe"
                            variant="icon"
                            target="_blank"
                            title={t('twitter')}
                        >
                            <IoLogoTwitter />
                        </Link>
                        <Link
                            href="https://www.instagram.com/themissingmaps/"
                            variant="icon"
                            target="_blank"
                            title={t('instagram')}
                        >
                            <IoLogoInstagram />
                        </Link>
                        <Link
                            href="https://github.com/mapswipe"
                            variant="icon"
                            target="_blank"
                            title={t('github')}
                        >
                            <IoLogoGithub />
                        </Link>
                        <Link
                            href="https://wiki.openstreetmap.org/wiki/MapSwipe"
                            variant="icon"
                            target="_blank"
                            title={t('osm-wiki')}
                        >
                            <FaRegNewspaper />
                        </Link>
                        <Link
                            href="mailto:info@mapswipe.org"
                            variant="icon"
                            target="_blank"
                            title={t('email')}
                        >
                            <IoMail />
                        </Link>
                        <Link
                            href="https://slack.openstreetmap.us/"
                            variant="icon"
                            target="_blank"
                            title={t('slack')}
                        >
                            <IoLogoSlack />
                        </Link>
                    </div>
                </div>
            </div>
            <div className={styles.bottomContainer}>
                <div className={styles.content}>
                    <div className={styles.leftContainer}>
                        {t('copyright')}
                    </div>
                    <div className={styles.rightContainer}>
                        <Link
                            href="/[locale]/privacy"
                        >
                            {t('privacy')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Footer;
