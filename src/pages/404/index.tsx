import React from 'react';
import {
    _cs,
} from '@togglecorp/fujs';

import Heading from 'components/Heading';
import ImageWrapper from 'components/ImageWrapper';
import Link from 'components/Link';

import styles from './styles.module.css';

export interface Props {
    className?: string;
}

function FourHundredFour(props: Props) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(className, styles.fourHundredFour)}>
            <div className={styles.leftContent}>
                <div className={styles.headingContainer}>
                    <Heading size="extraLarge">
                        404
                    </Heading>
                    <Heading
                        size="medium"
                        font="normal"
                    >
                        This area has not been swiped yet!
                    </Heading>
                </div>
                <Link
                    href="/"
                    variant="buttonTransparent"
                >
                    Go back to home
                </Link>
            </div>
            <div className={styles.rightContent}>
                <ImageWrapper
                    src="/img/404.svg"
                    alt="404 Page"
                />
            </div>
        </div>
    );
}

export default FourHundredFour;
