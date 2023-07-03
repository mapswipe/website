import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Heading from 'components/Heading';

import styles from './styles.module.css';

interface Props {
    className?: string;
    contentClassName?: string;
    containerClassName?: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    children?: React.ReactNode;
    actions?: React.ReactNode;
    withAlternativeBackground?: boolean;
    smallHeading?: boolean;
    sectionId?: string;
    actionsClassName?: string;
    descriptionClassName?: string;
    headingContainerClassName?: string;
}

function Section(props: Props) {
    const {
        className,
        contentClassName,
        containerClassName,
        title,
        description,
        descriptionClassName,
        headingContainerClassName,
        children,
        sectionId,
        actions,
        actionsClassName,
        smallHeading,
        withAlternativeBackground,
    } = props;

    return (
        <section
            id={sectionId}
            className={_cs(
                styles.section,
                withAlternativeBackground && styles.withAlternativeBackground,
                className,
            )}
        >
            <div className={_cs(styles.container, containerClassName)}>
                {(title || description) && (
                    <div className={_cs(styles.headingContainer, headingContainerClassName)}>
                        {title && (
                            <Heading
                                className={styles.heading}
                                size={smallHeading ? 'small' : 'medium'}
                            >
                                {title}
                            </Heading>
                        )}
                        {description && (
                            <div className={_cs(styles.description, descriptionClassName)}>
                                {description}
                            </div>
                        )}
                    </div>
                )}
                {children && (
                    <div className={contentClassName}>
                        {children}
                    </div>
                )}
                {actions && (
                    <div className={_cs(styles.actions, actionsClassName)}>
                        {actions}
                    </div>
                )}
            </div>
        </section>
    );
}

export default Section;
