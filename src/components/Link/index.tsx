import React from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { useRouter } from 'next/router';

interface LinkProps extends Omit<NextLinkProps, 'locale'> {
    children?: React.ReactNode;
    locale?: string;
}

// NOTE: this does not support relative links

function Link(props: LinkProps) {
    const {
        children,
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
            // eslint-disable-next-line
            {...rest}
            href={href}
        >
            {children}
        </NextLink>
    );
}

export default Link;
