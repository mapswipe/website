import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

type SizeTypes = 'small' | 'medium' | 'large';

const sizeToStyleMap: {
    [key in SizeTypes]: string;
} = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
};

export interface Props {
    className?: string;
    type: '1' | '2' | '3';
    size?: SizeTypes;
}
function ProjectTypeIcon(props: Props) {
    const {
        className: classNameFromProps,
        type,
        size = 'medium',
    } = props;

    const className = _cs(
        styles.icon,
        classNameFromProps,
        sizeToStyleMap[size],
    );

    return (
        <>
            {type === '1' && (
                <svg
                    className={className}
                    id="Layer_2"
                    data-name="Layer 2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 138 162"
                >
                    <g id="Layer_1-2" data-name="Layer 1">
                        <path id="Find" d="m138,69c0,2.38-.13,4.8-.37,7.19-.76,8.49-2.68,16.63-5.76,24.4-1.1,2.79-4.29,4.16-6.95,2.77-2.36-1.23-3.27-3.94-2.36-6.25,2.73-6.95,4.43-14.23,5.11-21.89.29-2.84.39-5.59.29-8.27-1.1-30.68-25.94-55.72-56.62-56.92-33.6-1.31-61.35,25.64-61.35,58.95,0,2.04.11,4.11.32,6.16,2.75,30.88,21.95,55.78,58.68,76.14,12.52-6.94,22.99-14.41,31.48-22.46,1.71-1.62,4.35-2.03,6.3-.71,2.69,1.82,2.94,5.54.72,7.67-9.74,9.33-21.79,17.88-36.13,25.6-.74.4-1.55.6-2.37.6s-1.63-.2-2.37-.6C25.74,139.4,3.44,110.71.37,76.12c-.24-2.32-.37-4.74-.37-7.12C0,30.95,30.95,0,69,0s69,30.95,69,69Zm-17.35,44.58c1.65,1.65,2.05,4.66.69,6.55-1.01,1.41-2.55,2.12-4.09,2.12-1.28,0-2.56-.49-3.54-1.46l-22.34-22.34c-7.37,5.61-16.89,8.53-27.1,7.26-16.84-2.1-30.22-15.71-32.05-32.58-2.57-23.63,17.27-43.46,40.9-40.9,16.87,1.83,30.48,15.21,32.58,32.05,1.27,10.2-1.65,19.73-7.26,27.1l22.2,22.2Zm-24.73-42.37c1.32-16.62-12.5-30.44-29.11-29.11-13.08,1.04-23.67,11.63-24.71,24.71-1.32,16.62,12.5,30.44,29.11,29.11,13.08-1.04,23.67-11.63,24.71-24.71Z" />
                    </g>
                </svg>
            )}
            {type === '2' && (
                <svg
                    className={className}
                    id="Layer_2"
                    data-name="Layer 2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 138 162"
                >
                    <g id="Layer_1-2" data-name="Layer 1">
                        <path id="Validate" d="m69,67.93l44.62-44.62c1.95-1.95,5.12-1.95,7.07,0,1.95,1.95,1.95,5.12,0,7.07l-48.16,48.16c-.98.98-2.26,1.46-3.54,1.46s-2.56-.49-3.54-1.46l-11.22-11.22c-1.95-1.95-1.95-5.12,0-7.07,1.95-1.95,5.12-1.95,7.07,0l7.69,7.69Zm63.63-25.6c-1.38-3.27-5.64-4.11-8.15-1.6-1.45,1.45-1.84,3.62-1.05,5.51,2.94,7.01,4.57,14.69,4.57,22.76,0,2.04-.11,4.11-.33,6.24-2.74,30.8-21.94,55.71-58.67,76.07-36.73-20.36-55.93-45.26-58.68-76.14-.21-2.06-.32-4.13-.32-6.16,0-32.53,26.47-59,59-59,11.01,0,21.32,3.04,30.15,8.31,1.94,1.16,4.42.9,6.02-.7l.11-.11c2.25-2.25,1.84-6.06-.89-7.7C94.04,3.58,81.93,0,69,0,30.95,0,0,30.95,0,69c0,2.38.13,4.8.37,7.12,3.08,34.58,25.37,63.28,66.26,85.28.74.4,1.55.6,2.37.6s1.63-.2,2.37-.6c40.89-22,63.19-50.7,66.26-85.21.25-2.39.37-4.81.37-7.2,0-9.45-1.91-18.46-5.37-26.67Zm-63.63-.33c2.51,0,4.94.35,7.25,1,1.72.48,3.56-.03,4.83-1.29,2.72-2.72,1.48-7.34-2.22-8.37-3.74-1.04-7.72-1.5-11.83-1.29-19.1,1-34.49,16.8-35.02,35.92-.6,21.91,17.96,39.73,40.12,37.9,16.8-1.39,30.69-14.28,33.39-30.92.18-1.1.31-2.2.39-3.28.33-4.59-5.29-7.07-8.54-3.82h0c-.84.84-1.36,1.95-1.44,3.14-1.1,14.98-14.46,26.6-30.06,24.83-12.36-1.4-22.31-11.36-23.69-23.73-1.82-16.27,10.92-30.09,26.83-30.09Z" />
                    </g>
                </svg>
            )}
            {type === '3' && (
                <svg
                    className={className}
                    id="Layer_2"
                    data-name="Layer 2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 138 162"
                >
                    <g id="Layer_1-2" data-name="Layer 1">
                        <path id="Compare" d="m69,0C30.95,0,0,30.95,0,69c0,2.38.13,4.8.37,7.12,3.08,34.58,25.37,63.28,66.26,85.28.74.4,1.55.6,2.37.6s1.63-.2,2.37-.6c40.89-22,63.19-50.7,66.26-85.21.25-2.39.37-4.81.37-7.2C138,30.95,107.05,0,69,0Zm0,151.3s0,0,0,0c-36.73-20.36-55.93-45.26-58.68-76.14-.21-2.06-.32-4.13-.32-6.16,0-32.53,26.47-59,59-59,0,0,0,0,0,0v141.3Zm11.57-47.16c-3.23,1.07-6.57-1.35-6.57-4.75h0c0-2.17,1.41-4.07,3.47-4.75,10.75-3.56,18.53-13.7,18.53-25.63s-7.71-21.98-18.39-25.59c-1.94-.65-3.43-2.34-3.59-4.37-.29-3.62,3.18-6.29,6.55-5.18,14.75,4.87,25.43,18.77,25.43,35.14s-10.68,30.27-25.43,35.14Zm-48.57-35.14c0-16.27,10.56-30.11,25.18-35.05,2.64-.89,5.7.4,6.56,3.05.91,2.79-.65,5.52-3.21,6.37-10.75,3.56-18.53,13.7-18.53,25.63s7.78,22.07,18.53,25.63c2.06.68,3.47,2.58,3.47,4.75h0c0,3.4-3.33,5.82-6.57,4.75-14.75-4.87-25.43-18.78-25.43-35.14Z" />
                    </g>
                </svg>
            )}
        </>
    );
}

export default ProjectTypeIcon;