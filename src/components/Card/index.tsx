import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Heading from 'components/Heading';

import styles from './styles.module.css';

interface Props {
    className?: string;
    actionsClassName?: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
}

function Card(props: Props) {
    const {
        className,
        actionsClassName,
        title,
        description,
        actions,
    } = props;

    return (
        <section className={_cs(className, styles.card)}>
            {title && (
                <Heading
                    size="small"
                >
                    {title}
                </Heading>
            )}
            {description && (
                <div>
                    {description}
                </div>
            )}
            {actions && (
                <div className={actionsClassName}>
                    {actions}
                </div>
            )}
        </section>
    );
}

export default Card;
