import React from 'react';
import { useTranslation, SSRConfig } from 'next-i18next';
import { useRouter } from 'next/router';
import { _cs } from '@togglecorp/fujs';
import Image from 'next/image';
import { MdMenu } from 'react-icons/md';
import { IoEarthSharp } from 'react-icons/io5';

import Link from 'components/Link';
import Button from 'components/Button';
import LanguageSwitcher from 'components/LanguageSwitcher';
import DropdownMenu from 'components/DropdownMenu';
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
                <Link
                    className={styles.logo}
                    href="/[locale]/"
                >
                    <Image
                        src="/logo.svg"
                        alt={t('mapswipe-logo')}
                        fill
                    />
                </Link>
                <div
                    className={_cs(
                        styles.routes,
                        isNavShown && styles.navShown,
                    )}
                >
                    <Link
                        className={_cs(
                            styles.link,
                            router.pathname === '/[locale]/get-involved' && styles.active,
                        )}
                        href="/[locale]/get-involved"
                    >
                        {t('get-involved-link')}
                    </Link>
                    <Link
                        className={_cs(
                            styles.link,
                            router.pathname === '/[locale]/data' && styles.active,
                        )}
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
                    <DropdownMenu
                        label={(
                            <>
                                <IoEarthSharp />
                                <span className={styles.currentLocale}>
                                    {currentLocale}
                                </span>
                            </>
                        )}
                        className={styles.dropdown}
                        dropdownContainerClassName={styles.languageList}
                    >
                        {i18nextConfig.i18n.locales.map((locale) => (
                            <LanguageSwitcher
                                key={locale}
                                locale={locale}
                                active={locale === currentLocale}
                                className={styles.language}
                                activeClassName={styles.activeLanguage}
                            />
                        ))}
                        <Link
                            className={styles.language}
                            href="/[locale]/get-involved/#individual"
                        >
                            {t('didnot-find-language')}
                        </Link>
                    </DropdownMenu>
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
