import React from 'react';
import cs from 'lib/cs';
import styles from './Heading.module.css';

// React twin of Heading.astro, for the islands (.astro components cannot
// render inside React trees). Keep the two in sync.

type Size = 'extraSmall' | 'small' | 'medium' | 'large' | 'extraLarge' | 'superLarge';

const elementMap = {
    extraSmall: 'h6',
    small: 'h5',
    medium: 'h4',
    large: 'h3',
    extraLarge: 'h2',
    superLarge: 'h1',
} as const;

interface Props {
    size?: Size;
    font?: 'heading' | 'normal';
    className?: string;
    children?: React.ReactNode;
}

function Heading(props: Props) {
    const {
        size = 'medium',
        font = 'heading',
        className,
        children,
    } = props;
    const Element = elementMap[size];
    return (
        <Element className={cs(styles.heading, styles[size], font === 'normal' && styles.normal, className)}>
            {children}
        </Element>
    );
}

export default Heading;
