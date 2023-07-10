import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

type Variant = 'primary' | 'border' | 'icon' | 'transparent';
type Spacing = 'small' | 'medium' | 'large';

const variantToStyleMap: {
    [key in Variant]: string | undefined;
} = {
    primary: undefined,
    transparent: styles.transparent,
    border: styles.border,
    icon: styles.icon,
};

const spacingToStyleMap: {
    [key in Spacing]: string | undefined;
} = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
};

export interface Props {
    className?: string;
    icon?: React.ReactNode;
    variant?: Variant;
    spacing?: Spacing;
    children?: React.ReactNode;
    tooltip?: string;
}

function Tag(props: Props) {
    const {
        children,
        icon,
        variant = 'primary',
        spacing = 'medium',
        className,
        tooltip,
    } = props;

    return (
        <div
            title={tooltip}
            className={_cs(
                className,
                styles.tag,
                variantToStyleMap[variant],
                spacingToStyleMap[spacing],
            )}
        >
            {icon}
            {children}
        </div>
    );
}

export default Tag;
