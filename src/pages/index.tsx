import React from 'react';
import { _cs } from '@togglecorp/fujs';
import Link from 'next/link';
import Image from 'next/image';

import styles from './styles.module.css';

interface Props {
    className?: string;
}

function Home(props: Props) {
    const {
        className,
    } = props;

    return (
        <div
            className={_cs(styles.home, className)}
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
                    Home
                </Link>
                <Link
                    href="/get-involved"
                    passHref
                >
                    Get Involved
                </Link>
                <Link
                    href="/data"
                    passHref
                >
                    Data
                </Link>
            </div>
        </div>
    );
}

export default Home;
