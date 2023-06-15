import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Heading from 'components/Heading';

import styles from './styles.module.css';

interface Props {
    className?: string;
    contentClassName?: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    children?: React.ReactNode;
}

function Section(props: Props) {
    const {
        className,
        contentClassName,
        title,
        description,
        children,
    } = props;

    return (
        <section className={_cs(className, styles.section)}>
            <div className={styles.headingContainer}>
                {title && (
                    <Heading
                        className={styles.heading}
                        size="large"
                    >
                        {title}
                    </Heading>
                )}
                {description && (
                    <Heading
                        font="normal"
                        className={styles.subHeading}
                        size="small"
                    >
                        {description}
                    </Heading>
                )}
            </div>
            <div className={contentClassName}>
                {children}
            </div>
        </section>
    );
}

export default Section;
