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
                    <div>
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
                            target="_blank"
                        >
                            <IoLogoFacebook />
                        </Link>
                        <Link
                            href="https://twitter.com/TheMissingMaps"
                            variant="icon"
                            target="_blank"
                        >
                            <IoLogoTwitter />
                        </Link>
                        <Link
                            href="https://www.instagram.com/themissingmaps/"
                            variant="icon"
                            target="_blank"
                        >
                            <IoLogoInstagram />
                        </Link>
                        <Link
                            href="https://github.com/mapswipe"
                            variant="icon"
                            target="_blank"
                        >
                            <IoLogoGithub />
                        </Link>
                        <Link
                            href="mailto:info@mapswipe.org"
                            variant="icon"
                            target="_blank"
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
                            target="_blank"
                        >
                            {t('privacy')}
                        </Link>
                        <Link
                            href="/[locale]/cookies"
                            target="_blank"
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
