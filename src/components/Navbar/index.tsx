import React from 'react';
import { useTranslation, SSRConfig } from 'next-i18next';
import { _cs } from '@togglecorp/fujs';
import Link from 'next/link';
import Image from 'next/image';

import styles from './styles.module.css';

interface Props extends SSRConfig {
    className?: string;
}

function Navbar(props: Props) {
    const {
        className,
    } = props;

    const { t } = useTranslation('common');

    return (
        <div
            className={_cs(styles.navbar, className)}
        >
            <Image
                className={styles.logo}
                src="/logo.svg"
                alt="Mapswipe"
                width={200}
                height={200}
            />
            <div className={styles.routes}>
                <Link
                    href="/"
                    passHref
                >
                    {t('home-link')}
                </Link>
                <Link
                    href="/get-involved"
                    passHref
                >
                    {t('get-involved-link')}
                </Link>
                <Link
                    href="/data"
                    passHref
                >
                    {t('data-link')}
                </Link>
            </div>
        </div>
    );
}

export default Navbar;
