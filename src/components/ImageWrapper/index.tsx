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

    const basePrefix = process.env.NEXT_PUBLIC_BASE_PREFIX ?? '';
    const isExternal = src.startsWith('http://') || src.startsWith('https://');

    let modifiedSrc = src;

    const isBasePrefixAvailable = basePrefix !== undefined && basePrefix.trim().length > 0;
    if (isBasePrefixAvailable) {
        modifiedSrc = isExternal ? src : `/${basePrefix}/${src.replace(/^\/+/, '')}`;
    }

    return (
        <div className={_cs(className, styles.imageWrapper)}>
            {(!nonOptimizedImage && !isBasePrefixAvailable) ? (
                <Image
                    src={modifiedSrc}
                    className={_cs(imageClassName, styles.image)}
                    fill
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherProps}
                />
            ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={modifiedSrc}
                    className={_cs(imageClassName, styles.image, styles.nonOptimizedImage)}
                    alt={otherProps.alt}
                />
            )}
        </div>
    );
}

export default ImageWrapper;
