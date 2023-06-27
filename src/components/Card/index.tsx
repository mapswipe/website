import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Heading from 'components/Heading';
import ImageWrapper from 'components/ImageWrapper';

import styles from './styles.module.css';

interface Props {
    className?: string;
    heading?: React.ReactNode;
    description?: React.ReactNode;
    headingFont?: 'normal' | 'heading';
    children?: React.ReactNode;
    childrenContainerClassName?: string;
    icons?: React.ReactNode;
    actions?: React.ReactNode;
    footerContent?: React.ReactNode;
    footerIcons?: React.ReactNode;
    footerActions?: React.ReactNode;
    imageClassName?: string;
    cardContentClassName?: string;
    coverImageUrl?: string;
    coverImageOnSide?: boolean;
    borderless?: boolean;
    nonOptimizedImage?: boolean;
}

function Card(props: Props) {
    const {
        className,
        heading,
        headingFont,
        description,
        imageClassName,
        childrenContainerClassName,
        icons,
        actions,
        footerContent,
        cardContentClassName,
        footerActions,
        footerIcons,
        children,
        coverImageUrl,
        coverImageOnSide,
        borderless,
        nonOptimizedImage,
    } = props;

    const showHeader = icons || heading || actions;
    const showFooter = footerIcons || footerContent || footerActions;

    return (
        <div
            className={_cs(
                styles.card,
                className,
                coverImageOnSide && styles.coverImageOnSide,
                borderless && styles.borderless,
            )}
        >
            {coverImageUrl && (
                <ImageWrapper
                    className={_cs(styles.coverImageWrapper, imageClassName)}
                    imageClassName={styles.image}
                    src={coverImageUrl}
                    nonOptimizedImage={nonOptimizedImage}
                    alt="cover-image"
                />
            )}
            <div className={_cs(styles.cardContent, cardContentClassName)}>
                {(showHeader || !!description) && (
                    <div className={styles.headerWrapper}>
                        {showHeader && (
                            <div className={styles.header}>
                                {icons && (
                                    <div>
                                        {icons}
                                    </div>
                                )}
                                <Heading
                                    className={styles.heading}
                                    font={headingFont}
                                    size="extraSmall"
                                >
                                    {heading}
                                </Heading>
                                {actions && (
                                    <div>
                                        {actions}
                                    </div>
                                )}
                            </div>
                        )}
                        {description && (
                            <div>
                                {description}
                            </div>
                        )}
                    </div>
                )}
                <div className={_cs(styles.childrenContainer, childrenContainerClassName)}>
                    {children}
                </div>
                {showFooter && (
                    <div className={styles.footer}>
                        {footerIcons && (
                            <div>
                                {footerIcons}
                            </div>
                        )}
                        <div className={styles.footerContent}>
                            {footerContent}
                        </div>
                        {footerActions && (
                            <div>
                                {footerActions}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Card;
