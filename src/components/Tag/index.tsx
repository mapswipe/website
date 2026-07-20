import React from 'react';
import cs from 'lib/cs';
import styles from './styles.module.css';

// React twin of Tag.astro, for the islands (.astro components cannot render
// inside React trees). Keep the two in sync. `as` picks the element — the
// islands' existing markup uses divs, the .astro twin renders a span.

type Variant = 'primary' | 'transparent' | 'border' | 'icon';
type Spacing = 'small' | 'medium' | 'large';

const variantMap: Record<Variant, string | undefined> = {
    primary: undefined,
    transparent: styles.transparent,
    border: styles.border,
    icon: styles.icon,
};
const spacingMap: Record<Spacing, string> = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
};

interface Props {
    as?: 'div' | 'span';
    variant?: Variant;
    spacing?: Spacing | 'none';
    className?: string;
    title?: string;
    children?: React.ReactNode;
}

function Tag(props: Props) {
    const {
        as: Element = 'div',
        variant = 'primary',
        // medium default: parity with the Next Tag, which applied its
        // spacing map unconditionally
        spacing = 'medium',
        className,
        title,
        children,
    } = props;
    return (
        <Element
            className={cs(styles.tag, variantMap[variant], spacing !== 'none' && spacingMap[spacing as Spacing], className)}
            title={title}
        >
            {children}
        </Element>
    );
}

export default Tag;
