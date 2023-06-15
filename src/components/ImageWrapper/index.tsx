import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Image, { ImageProps } from 'next/image';

import styles from './styles.module.css';

export interface Props extends ImageProps {
    className?: string;
    src: string;
    imageClassName?: string;
}

function ImageWrapper(props: Props) {
    const {
        className,
        imageClassName,
        src,
        ...otherProps
    } = props;

    return (
        <div className={_cs(className, styles.imageWrapper)}>
            <Image
                src={src}
                className={_cs(imageClassName, styles.image)}
                // eslint-disable-next-line
                {...otherProps}
            />
        </div>
    );
}

export default ImageWrapper;
