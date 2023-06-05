import React from 'react';
import { useTranslation } from 'next-i18next';
import {
    _cs,
} from '@togglecorp/fujs';
import Link from 'components/Link';
import {
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
                        size="extraSmall"
                        font="normal"
                    >
                        {t('footer-about-us-title')}
                    </Heading>
                    <div className={styles.description}>
                        {t('footer-about-us-description')}
                    </div>
                </div>
                <div className={styles.section}>
                    <Heading
                        className={styles.heading}
                        size="extraSmall"
                        font="normal"
                    >
                        {t('footer-quick-links')}
                    </Heading>
                    <div className={styles.links}>
                        <Link
                            className={styles.link}
                            href="/[locale]/"
                        >
                            {t('home-link')}
                        </Link>
                        <Link
                            className={styles.link}
                            href="/[locale]/get-involved"
                        >
                            {t('get-involved-link')}
                        </Link>
                        <Link
                            className={styles.link}
                            href="/[locale]/data"
                        >
                            {t('data-link')}
                        </Link>
                    </div>
                </div>
                <div className={styles.section}>
                    <Heading
                        className={styles.heading}
                        size="extraSmall"
                        font="normal"
                    >
                        {t('footer-follow-us-title')}
                    </Heading>
                    <div className={styles.socialLinks}>
                        <Link
                            href="https://www.facebook.com/TheMissingMaps"
                            variant="icon"
                        >
                            <IoLogoFacebook />
                        </Link>
                        <Link
                            href="https://twitter.com/TheMissingMaps"
                            variant="icon"
                        >
                            <IoLogoTwitter />
                        </Link>
                        <Link
                            href="https://www.instagram.com/themissingmaps/"
                            variant="icon"
                        >
                            <IoLogoInstagram />
                        </Link>
                        <Link
                            href="https://github.com/mapswipe"
                            variant="icon"
                        >
                            <IoLogoGithub />
                        </Link>
                        <Link
                            href="mailto:info@mapswipe.org"
                            variant="icon"
                        >
                            <IoMail />
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
                        <Link
                            href="/[locale]/cookies"
                        >
                            {t('cookies')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Footer;
