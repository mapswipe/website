import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    actionsClassName?: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
}

function CenteredCard(props: Props) {
    const {
        className,
        actionsClassName,
        title,
        description,
        actions,
    } = props;

    return (
        <div className={_cs(className, styles.card)}>
            {title && (
                <div className={styles.heading}>
                    {title}
                </div>
            )}
            {description && (
                <div className={styles.description}>
                    {description}
                </div>
            )}
            {actions && (
                <div className={_cs(actionsClassName, styles.actions)}>
                    {actions}
                </div>
            )}
        </div>
    );
}

export default CenteredCard;
