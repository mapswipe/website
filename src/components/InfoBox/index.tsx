import React from 'react';
import {
    _cs,
} from '@togglecorp/fujs';
import { IoAdd } from 'react-icons/io5';

import Heading from 'components/Heading';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    value?: string;
    label?: string;
}

function InfoBox(props: Props) {
    const {
        className,
        value,
        label,
    } = props;

    return (
        <div className={_cs(className, styles.infoBox)}>
            <Heading className={styles.topContainer}>
                {value}
                <IoAdd className={styles.icon} />
            </Heading>
            <div>
                {label}
            </div>
        </div>
    );
}

export default InfoBox;
