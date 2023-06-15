import { _cs } from '@togglecorp/fujs';
import { useRouter } from 'next/router';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';

import languageDetector from 'utils/languageDetector';
import styles from './styles.module.css';

interface Props extends Omit<NextLinkProps, 'href' | 'locale'> {
    className?: string;
    activeClassName?: string;
    locale: string;
    active: boolean;
}

function LanguageSwitcher(props: Props) {
    const {
        className,
        locale,
        active,
        activeClassName,
        ...rest
    } = props;

    const router = useRouter();

    const {
        query,
        pathname,
    } = router;

    // TODO: disable if the current locale is the same as locale

    return (
        <NextLink
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            href={{
                pathname,
                query: {
                    ...query,
                    locale,
                },
            }}
            className={_cs(
                styles.languageSwitcher,
                active && styles.active,
                active && activeClassName,
                className,
            )}
            onClick={() => {
                if (languageDetector.cache) {
                    languageDetector.cache(locale);
                }
            }}
        >
            {`${locale}${active ? '*' : ''}`}
        </NextLink>
    );
}

export default LanguageSwitcher;
