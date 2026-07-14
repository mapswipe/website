import React from 'react';
import cs from 'lib/cs';
import styles from './styles.module.css';

// React twin of Button.astro, for the islands (.astro components cannot
// render inside React trees; islands also need onClick). Keep the two in sync.

type Variant = 'transparent' | 'primary' | 'border' | 'icon';

const variantMap: Record<Variant, string | undefined> = {
    transparent: undefined,
    primary: styles.primary,
    border: styles.border,
    icon: styles.icon,
};

interface Props extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
    variant?: Variant;
}

function Button(props: Props) {
    const {
        variant = 'primary',
        className,
        children,
        ...rest
    } = props;
    return (
        <button type="button" className={cs(styles.button, variantMap[variant], className)} {...rest}>
            {children}
        </button>
    );
}

export default Button;
