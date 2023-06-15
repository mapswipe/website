import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

type Variant = 'transparent' | 'primary' | 'border' | 'icon';
const variantToStyleMap: {
    [key in Variant]: string | undefined;
} = {
    transparent: undefined,
    primary: styles.primary,
    border: styles.border,
    icon: styles.icon,
};
interface ButtonProps extends React.HTMLProps<HTMLButtonElement> {
    className?: string;
    variant?: Variant;
}

// NOTE: this does not support relative buttons

function Button(props: ButtonProps) {
    const {
        children,
        variant = 'primary',
        className,
        ...rest
    } = props;

    return (
        <button
            className={_cs(
                className,
                styles.button,
                variantToStyleMap[variant],
            )}
            // eslint-disable-next-line
            {...rest}
            type="button"
        >
            {children}
        </button>
    );
}

export default Button;
