import React from 'react';
import cs from 'lib/cs';
import styles from './styles.module.css';

// React twin of ImageWrapper.astro, for the islands (.astro components cannot
// render inside React trees). Keep the two in sync. With `src` it renders a
// plain <img>; without it, children supply the media.

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
    className?: string;
    imageClassName?: string;
    children?: React.ReactNode;
}

function ImageWrapper(props: Props) {
    const {
        className,
        imageClassName,
        src,
        children,
        ...rest
    } = props;
    return (
        <div className={cs(styles.imageWrapper, className)}>
            {src ? (
                <img
                    className={cs(styles.image, imageClassName)}
                    src={src}
                    {...rest}
                />
            ) : children}
        </div>
    );
}

export default ImageWrapper;
