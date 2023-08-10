import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';

const buildDate = process.env.MAPSWIPE_BUILD_DATE;

interface Props {
    title?: string;
    description?: string;
}

function OgMeta(props: Props) {
    const {
        title: titleFromProps,
        description: descriptionFromProps,
    } = props;

    const { t } = useTranslation('common');

    const title = titleFromProps || String(t('meta-page-title'));
    const description = descriptionFromProps || String(t('meta-page-description'));

    return (
        <Head>
            <title>{title}</title>

            <meta name="description" content={description} />

            <meta property="og:type" content="website" />
            <meta property="og:updated_time" content={buildDate ?? '1691561444886'} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content="/ms-website.png" />

            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content="/ms-website.png" />
        </Head>
    );
}

export default OgMeta;
