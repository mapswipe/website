import { useRouter } from 'next/router';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';

import languageDetector from 'utils/languageDetector';

interface LinkProps extends Omit<NextLinkProps, 'href' | 'locale'> {
    locale: string;
    active: boolean;
}

function LanguageSwitchLink(props: LinkProps) {
    const {
        locale,
        active,
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

export default LanguageSwitchLink;
