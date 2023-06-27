import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Image, { ImageProps } from 'next/image';

import styles from './styles.module.css';

export interface Props extends ImageProps {
    className?: string;
    src: string;
    imageClassName?: string;
    nonOptimizedImage?: boolean;
}

function ImageWrapper(props: Props) {
    const {
        className,
        imageClassName,
        src,
        nonOptimizedImage,
        ...otherProps
    } = props;

    return (
        <div className={_cs(className, styles.imageWrapper)}>
            {!nonOptimizedImage ? (
                <Image
                    src={src}
                    className={_cs(imageClassName, styles.image)}
                    fill
                    // eslint-disable-next-line
                    {...otherProps}
                />
            ) : (
                // eslint-disable-next-line
                <img
                    src={src}
                    className={_cs(imageClassName, styles.image, styles.nonOptimizedImage)}
                    alt={otherProps.alt}
                />
            )}
        </div>
    );
}

export default ImageWrapper;
