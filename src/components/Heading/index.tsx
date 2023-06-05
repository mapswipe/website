import React from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import styles from './styles.module.css';

type SizeTypes = 'extraSmall' | 'small' | 'medium' | 'large' | 'extraLarge' | 'superLarge';
type FontTypes = 'heading' | 'normal';

const sizeToStyleMap: {
    [key in SizeTypes]: string;
} = {
    extraSmall: styles.extraSmall,
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
    extraLarge: styles.extraLarge,
    superLarge: styles.superLarge,
};

const fontToStyleMap: {
    [key in FontTypes]: string;
} = {
    heading: styles.heading,
    normal: styles.normal,
};

function isString(d: unknown): d is string {
    return (typeof d) === 'string';
}

export interface Props {
    className?: string;
    children?: React.ReactNode;
    size?: SizeTypes;
    title?: string;
    ellipsize?: boolean;
    ellipsizeContainerClassName?: string;
    font?: FontTypes;
}

function Heading(props: Props) {
    const {
        className: classNameFromProps,
        children,
        size = 'medium',
        title: titleFromProps,
        ellipsize,
        ellipsizeContainerClassName,
        font = 'heading',
    } = props;

    let title = titleFromProps;

    if (ellipsize && isNotDefined(titleFromProps) && isString(children)) {
        title = children;
    }

    const className = _cs(
        styles.heading,
        ellipsize && styles.ellipsize,
        sizeToStyleMap[size],
        fontToStyleMap[font],
        classNameFromProps,
    );

    const heading = (
        <>
            {size === 'extraSmall' && (
                <h6
                    className={className}
                    title={title}
                >
                    { children }
                </h6>
            )}
            {size === 'small' && (
                <h5
                    className={className}
                    title={title}
                >
                    { children }
                </h5>
            )}
            {size === 'medium' && (
                <h4
                    className={className}
                    title={title}
                >
                    { children }
                </h4>
            )}
            {size === 'large' && (
                <h3
                    className={className}
                    title={title}
                >
                    { children }
                </h3>
            )}
            {size === 'extraLarge' && (
                <h2
                    className={className}
                    title={title}
                >
                    { children }
                </h2>
            )}
            {size === 'superLarge' && (
                <h1
                    className={className}
                    title={title}
                >
                    { children }
                </h1>
            )}
        </>
    );

    if (ellipsize) {
        return (
            <div className={_cs(styles.ellipsizeContainer, ellipsizeContainerClassName)}>
                {heading}
            </div>
        );
    }

    return heading;
}

export default Heading;
