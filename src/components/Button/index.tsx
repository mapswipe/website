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
export interface Props extends React.HTMLProps<HTMLButtonElement> {
    className?: string;
    variant?: Variant;
    elementRef?: React.Ref<HTMLButtonElement>;
}

// NOTE: this does not support relative buttons

function Button(props: Props) {
    const {
        children,
        variant = 'primary',
        className,
        elementRef,
        ...rest
    } = props;

    return (
        <button
            ref={elementRef}
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
