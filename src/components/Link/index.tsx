import React from 'react';
import { _cs } from '@togglecorp/fujs';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { useRouter } from 'next/router';

import styles from './styles.module.css';

type Variant = 'transparent' | 'button' | 'buttonTransparent' | 'icon';
const variantToStyleMap: {
    [key in Variant]: string | undefined;
} = {
    transparent: undefined,
    button: styles.button,
    buttonTransparent: styles.buttonTransparent,
    icon: styles.icon,
};

interface Props extends Omit<NextLinkProps, 'locale'> {
    children?: React.ReactNode;
    className?: string;
    locale?: string;
    target?: string;
    variant?: Variant;
}

// NOTE: this does not support relative links

function Link(props: Props) {
    const {
        children,
        variant = 'transparent',
        className,
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

    return (
        <NextLink
            className={_cs(
                className,
                styles.link,
                variantToStyleMap[variant],
            )}
            // eslint-disable-next-line
            {...rest}
            href={href}
        >
            {children}
        </NextLink>
    );
}

export default Link;
