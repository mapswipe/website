import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

type Variant = 'primary' | 'border' | 'icon';

const variantToStyleMap: {
    [key in Variant]: string | undefined;
} = {
    primary: undefined,
    border: styles.border,
    icon: styles.icon,
};
export interface Props {
    className?: string;
    icon?: React.ReactNode;
    variant?: Variant;
    children?: React.ReactNode;
}

function Tag(props: Props) {
    const {
        children,
        icon,
        variant = 'primary',
        className,
    } = props;

    return (
        <div
            className={_cs(
                className,
                styles.tag,
                variantToStyleMap[variant],
            )}
        >
            {icon}
            {children}
        </div>
    );
}

export default Tag;
