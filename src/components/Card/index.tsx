import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Heading from 'components/Heading';

import styles from './styles.module.css';

interface Props {
    className?: string;
    heading?: React.ReactNode;
    description?: React.ReactNode;
    children?: React.ReactNode;
    childrenContainerClassName?: string;
    icons?: React.ReactNode;
    actions?: React.ReactNode;
    footerContent?: React.ReactNode;
    footerIcons?: React.ReactNode;
    footerActions?: React.ReactNode;
}

function Card(props: Props) {
    const {
        className,
        heading,
        description,
        childrenContainerClassName,
        icons,
        actions,
        footerContent,
        footerActions,
        footerIcons,
        children,
    } = props;

    const showHeader = icons || heading || actions;
    const showFooter = footerIcons || footerContent || footerActions;

    return (
        <div className={_cs(styles.card, className)}>
            {showHeader && (
                <div className={styles.header}>
                    {icons && (
                        <div className={styles.icons}>
                            {icons}
                        </div>
                    )}
                    <Heading
                        className={styles.heading}
                        size="small"
                    >
                        {heading}
                    </Heading>
                    {actions && (
                        <div className={styles.actions}>
                            {actions}
                        </div>
                    )}
                </div>
            )}
            {description && (
                <div className={styles.description}>
                    {description}
                </div>
            )}
            <div className={_cs(styles.childrenContainer, childrenContainerClassName)}>
                {children}
            </div>
            {showFooter && (
                <div className={styles.footer}>
                    {footerIcons && (
                        <div className={styles.footerIcons}>
                            {footerIcons}
                        </div>
                    )}
                    <div className={styles.footerContent}>
                        {footerContent}
                    </div>
                    {footerActions && (
                        <div className={styles.footerActions}>
                            {footerActions}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Card;
