import React from 'react';
import { _cs } from '@togglecorp/fujs';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { useRouter } from 'next/router';

import styles from './styles.module.css';

type Variant = 'transparent' | 'button' | 'buttonTransparent' | 'icon' | 'underline';
const variantToStyleMap: {
    [key in Variant]: string | undefined;
} = {
    transparent: undefined,
    button: styles.button,
    underline: styles.underline,
    buttonTransparent: styles.buttonTransparent,
    icon: styles.icon,
};

interface Props extends Omit<NextLinkProps, 'locale'> {
    children?: React.ReactNode;
    className?: string;
    locale?: string;
    rel?: string;
    target?: string;
    variant?: Variant;
    title?: React.ReactNode;
    download?: boolean;
    // NOTE: For client-side downloads (e.g. a data: URL) where there is no
    // media server to set Content-Disposition. Sets the HTML download
    // attribute so the browser saves the file with this name.
    downloadFileName?: string;
}

// NOTE: this does not support relative links

function Link(props: Props) {
    const {
        children,
        variant = 'transparent',
        className,
        title,
        download = false,
        downloadFileName,
        ...rest
    } = props;

    const router = useRouter();

    let locale = rest.locale ?? router.query.locale;
    if (Array.isArray(locale)) {
        [locale] = locale;
    }

    let { href } = rest;
    if (locale) {
        if (typeof href === 'string') {
            href = href.replace('[locale]', locale);
        } else {
            href = {
                ...href,
                pathname: href.pathname?.replace('[locale]', locale),
            };
        }
    }

    let { target, rel } = rest;
    if (download) {
        // NOTE: the server is configured to set the Content-Disposition
        // header for media files when treat_as_download is set, which
        // makes the browser download the file instead of opening it.
        // NOTE: media URLs do not have query params so we can safely
        // append the query param with `?`
        if (typeof href === 'string') {
            href = `${href}?treat_as_download=true`;
        }
        // NOTE: fallback for when the server does not handle
        // treat_as_download: open the file in a new tab instead of
        // navigating away from the page
        target = target ?? '_blank';
        rel = rel ?? 'noopener noreferrer';
    }

    return (
        <NextLink
            className={_cs(
                className,
                styles.link,
                variantToStyleMap[variant],
            )}
            // eslint-disable-next-line
            {...rest}
            target={target}
            rel={rel}
            title={title ? String(title) : undefined}
            href={href}
            download={downloadFileName}
        >
            {children}
        </NextLink>
    );
}

export default Link;
