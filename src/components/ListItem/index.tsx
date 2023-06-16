import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoCheckmarkCircle } from 'react-icons/io5';

import styles from './styles.module.css';

interface Props {
    className?: string;
    icon?: React.ReactNode;
    label: React.ReactNode;
}

function ListItem(props: Props) {
    const {
        className,
        icon = <IoCheckmarkCircle />,
        label,
    } = props;

    return (
        <div className={_cs(styles.listItem, className)}>
            <div className={styles.icon}>
                {icon}
            </div>
            <div className={styles.label}>
                {label}
            </div>
        </div>
    );
}

export default ListItem;
