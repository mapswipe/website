import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    label?: React.ReactNode;
    value?: React.ReactNode;
    description?: React.ReactNode;
    variant?: 'box' | 'circle';
    circleColor?: 'accent' | 'complement';
}

function KeyFigure(props: Props) {
    const {
        className,
        label,
        value,
        variant = 'box',
        circleColor = 'accent',
        description,
    } = props;

    return (
        <div
            className={_cs(
                styles.keyFigure,
                className,
                variant === 'circle' && styles.circle,
                circleColor === 'complement' && styles.complement,
            )}
        >
            <div className={styles.label}>
                {label}
            </div>
            <div className={styles.value}>
                {value}
            </div>
            <div className={styles.description}>
                {description}
            </div>
        </div>
    );
}

export default KeyFigure;
