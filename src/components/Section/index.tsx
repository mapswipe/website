import React from 'react';
import cs from 'lib/cs';
import Heading from '../Heading';
import styles from './styles.module.css';

// React twin of Section.astro, for the islands (.astro components cannot
// render inside React trees). Keep the two in sync. headingContainerClassName
// is an extra over the .astro twin, used only by the islands.

interface Props {
    id?: string;
    className?: string;
    containerClassName?: string;
    headingContainerClassName?: string;
    contentClassName?: string;
    descriptionClassName?: string;
    actionsClassName?: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    withAlternativeBackground?: boolean;
    children?: React.ReactNode;
}

function Section(props: Props) {
    const {
        id,
        className,
        containerClassName,
        headingContainerClassName,
        contentClassName,
        descriptionClassName,
        actionsClassName,
        title,
        description,
        actions,
        withAlternativeBackground = false,
        children,
    } = props;
    return (
        <section
            id={id}
            className={cs(styles.section, withAlternativeBackground && styles.withAlternativeBackground, className)}
        >
            <div className={cs(styles.container, containerClassName)}>
                {(title || description) && (
                    <div className={cs(styles.headingContainer, headingContainerClassName)}>
                        {title && <Heading className={styles.heading}>{title}</Heading>}
                        {description && <div className={cs(styles.description, descriptionClassName)}>{description}</div>}
                    </div>
                )}
                {children && <div className={contentClassName}>{children}</div>}
                {actions && <div className={cs(styles.actions, actionsClassName)}>{actions}</div>}
            </div>
        </section>
    );
}

export default Section;
