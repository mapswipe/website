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
    actions?: React.ReactNode;
    withAlternativeBackground?: boolean;
}

function Section(props: Props) {
    const {
        className,
        contentClassName,
        title,
        description,
        children,
        actions,
        withAlternativeBackground,
    } = props;

    return (
        <section
            className={_cs(
                styles.section,
                withAlternativeBackground && styles.withAlternativeBackground,
                className,
            )}
        >
            <div className={styles.container}>
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
                        <div className={styles.description}>
                            {description}
                        </div>
                    )}
                </div>
                {children && (
                    <div className={contentClassName}>
                        {children}
                    </div>
                )}
                {actions && (
                    <div className={styles.actions}>
                        {actions}
                    </div>
                )}
            </div>
        </section>
    );
}

export default Section;
