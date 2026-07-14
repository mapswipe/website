import React from 'react';
import cs from 'lib/cs';
import Heading from '../Heading';
import ImageWrapper from '../ImageWrapper';
import styles from './styles.module.css';

// React twin of Card.astro, for the islands (.astro components cannot render
// inside React trees). Keep the two in sync. Extras over the .astro twin,
// used only by the islands: headingFont, actionsClassName, coverAlt, footer
// (the Next Card's footer/footerContent block).

interface Props {
    as?: 'div' | 'article';
    className?: string;
    heading?: React.ReactNode;
    headingFont?: 'heading' | 'normal';
    icons?: React.ReactNode;
    actions?: React.ReactNode;
    actionsClassName?: string;
    cover?: React.ReactNode;
    coverImageUrl?: string;
    coverAlt?: string;
    coverWrapperClassName?: string;
    childrenContainerClassName?: string;
    footer?: React.ReactNode;
    borderless?: boolean;
    coverImageOnSide?: boolean;
    children?: React.ReactNode;
}

function Card(props: Props) {
    const {
        as: Element = 'div',
        className,
        heading,
        headingFont,
        icons,
        actions,
        actionsClassName,
        cover,
        coverImageUrl,
        coverAlt,
        coverWrapperClassName,
        childrenContainerClassName,
        footer,
        borderless = false,
        coverImageOnSide = false,
        children,
    } = props;
    return (
        <Element className={cs(styles.card, borderless && styles.borderless, coverImageOnSide && styles.coverImageOnSide, className)}>
            {cover}
            {coverImageUrl && (
                <ImageWrapper
                    className={cs(styles.coverImageWrapper, coverWrapperClassName)}
                    imageClassName={styles.image}
                    src={coverImageUrl}
                    alt={coverAlt}
                    loading="lazy"
                    decoding="async"
                />
            )}
            <div className={styles.cardContent}>
                <div className={styles.headerWrapper}>
                    <div className={styles.header}>
                        {icons && <div>{icons}</div>}
                        {heading && (
                            <Heading size="extraSmall" font={headingFont} className={styles.heading}>
                                {heading}
                            </Heading>
                        )}
                    </div>
                    {actions && <div className={actionsClassName}>{actions}</div>}
                </div>
                <div className={cs(styles.childrenContainer, childrenContainerClassName)}>
                    {children}
                </div>
                {footer && (
                    <div className={styles.footer}>
                        <div className={styles.footerContent}>{footer}</div>
                    </div>
                )}
            </div>
        </Element>
    );
}

export default Card;
