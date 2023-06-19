import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Heading from 'components/Heading';

import styles from './styles.module.css';

interface Props {
    className?: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    rightContent?: React.ReactNode;
    sectionClassName?: string;
}

function Hero(props: Props) {
    const {
        className,
        title,
        description,
        actions,
        rightContent,
        sectionClassName,
    } = props;

    return (
        <div
            className={_cs(
                className,
                styles.hero,
                !rightContent && styles.withoutRightContent,
            )}
        >
            <div className={_cs(styles.section, sectionClassName)}>
                <div className={styles.mainContent}>
                    <div className={styles.left}>
                        <Heading
                            size="extraLarge"
                            className={styles.heading}
                        >
                            {title}
                        </Heading>
                        <div
                            className={styles.description}
                        >
                            {description}
                        </div>
                        {actions && (
                            <div className={styles.buttonsContainer}>
                                {actions}
                            </div>
                        )}
                        <div />
                    </div>
                    {rightContent && (
                        <div className={styles.right}>
                            {rightContent}
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.angledBackground} />
        </div>
    );
}

export default Hero;
