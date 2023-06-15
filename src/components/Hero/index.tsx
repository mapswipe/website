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
}

function Hero(props: Props) {
    const {
        className,
        title,
        description,
        actions,
        rightContent,
    } = props;

    return (
        <div className={_cs(className, styles.hero)}>
            <div className={styles.background} />
            <section className={styles.section}>
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
                </div>
                {rightContent && (
                    <div className={styles.right}>
                        {rightContent}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Hero;
