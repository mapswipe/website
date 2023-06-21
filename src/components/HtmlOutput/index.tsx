import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    content: string;
}

function HtmlOutput(props: Props) {
    const {
        className,
        content,
    } = props;

    return (
        <div
            className={_cs(styles.htmlOutput, className)}
            // TODO: sanitize
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
}

export default HtmlOutput;
