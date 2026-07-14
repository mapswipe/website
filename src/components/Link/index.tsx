import React from 'react';
import cs from 'lib/cs';
import styles from './styles.module.css';

// React twin of Link.astro, for the islands (.astro components cannot render
// inside React trees). Keep the two in sync.

type Variant = 'transparent' | 'button' | 'buttonTransparent' | 'icon' | 'underline';

const variantMap: Record<Variant, string | undefined> = {
    transparent: undefined,
    button: styles.button,
    buttonTransparent: styles.buttonTransparent,
    icon: styles.icon,
    underline: styles.underline,
};

interface Props extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    variant?: Variant;
}

function Link(props: Props) {
    const {
        variant = 'transparent',
        className,
        children,
        ...rest
    } = props;
    return (
        <a
            className={cs(styles.link, variantMap[variant], className)}
            {...rest}
        >
            {children}
        </a>
    );
}

export default Link;
