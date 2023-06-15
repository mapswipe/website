import React from 'react';
import { useTranslation, SSRConfig } from 'next-i18next';
import { useRouter } from 'next/router';
import { _cs } from '@togglecorp/fujs';
import Image from 'next/image';
import { MdMenu } from 'react-icons/md';

import Link from 'components/Link';
import Button from 'components/Button';
import LanguageSwitcher from 'components/LanguageSwitcher';
import useBooleanState from 'hooks/useBooleanState';

import i18nextConfig from '../../../next-i18next.config';

import styles from './styles.module.css';

interface Props extends SSRConfig {
    className?: string;
}

function Navbar(props: Props) {
    const {
        className,
    } = props;

    const { t } = useTranslation('common');
    const router = useRouter();
    const [isNavShown, , , , toggleNavVisibility] = useBooleanState(false);

    let currentLocale = router.query.locale ?? i18nextConfig.i18n.defaultLocale;
    if (Array.isArray(currentLocale)) {
        [currentLocale] = currentLocale;
    }

    return (
        <div className={_cs(styles.navbar, className)}>
            <div className={styles.navbarContent}>
                <div className={styles.logo}>
                    <Image
                        src="/logo.svg"
                        alt="Mapswipe"
                        layout="fill"
                    />
                </div>
                <div
                    className={_cs(
                        styles.routes,
                        isNavShown && styles.navShown,
                    )}
                >
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
                    <Link
                        className={styles.link}
                        href="https://community.mapswipe.org/"
                    >
                        {t('community-dashboard-link')}
                    </Link>
                </div>
                <div className={styles.rightContainer}>
                    <div className={styles.languageSwitcherList}>
                        {i18nextConfig.i18n.locales.map((locale) => (
                            <LanguageSwitcher
                                className={styles.languageSwitcher}
                                key={locale}
                                locale={locale}
                                active={locale === currentLocale}
                            />
                        ))}
                    </div>
                    <Button
                        className={_cs(
                            styles.menu,
                        )}
                        name="toggle"
                        variant="transparent"
                        onClick={toggleNavVisibility}
                    >
                        <MdMenu />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Navbar;
