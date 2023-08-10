import React from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { SSRConfig, useTranslation } from 'next-i18next';
import { _cs } from '@togglecorp/fujs';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import {
    IoPerson,
    IoCalendarClearOutline,
} from 'react-icons/io5';

import OgMeta from 'components/OgMeta';
import ImageWrapper from 'components/ImageWrapper';
import Tag from 'components/Tag';
import Page from 'components/Page';
import HtmlOutput from 'components/HtmlOutput';
import Section from 'components/Section';
import Hero from 'components/Hero';

import getBlogs, { Blog as BlogType } from 'utils/requests/getBlogs';

import i18nextConfig from '../../../../../next-i18next.config';

import styles from './styles.module.css';

interface Props extends SSRConfig {
    className?: string;
    blog: BlogType;
    contentHtml: string;
}

function Blog(props: Props) {
    const {
        className,
        contentHtml,
        blog,
    } = props;

    const { t } = useTranslation('blog');

    return (
        <Page contentClassName={_cs(styles.blog, className)}>
            <OgMeta
                title={String(t('blog-tab-head', { blogTitle: blog.title }))}
                description={blog.description}
            />
            <Hero
                className={styles.hero}
                title={blog?.title}
                mainContentClassName={styles.heroMainContent}
                leftContentClassName={styles.heroLeftContent}
                description={(
                    <div className={styles.heroDescription}>
                        {blog.publishedDate && (
                            <Tag
                                className={styles.heroTag}
                                icon={<IoCalendarClearOutline />}
                                variant="transparent"
                            >
                                {t('date', { date: blog.publishedDate })}
                            </Tag>
                        )}
                        {blog.author && (
                            <Tag
                                className={styles.heroTag}
                                icon={<IoPerson />}
                                variant="transparent"
                            >
                                {blog.author}
                            </Tag>
                        )}
                    </div>
                )}
                rightContent={blog.coverImage ? (
                    <ImageWrapper
                        className={styles.illustration}
                        src={blog.coverImage}
                        alt={blog.title}
                    />
                ) : (
                    <div />
                )}
            />
            <Section>
                <HtmlOutput
                    content={contentHtml}
                />
            </Section>
        </Page>
    );
}

export const getI18nPaths = () => (
    i18nextConfig.i18n.locales.map((lng) => ({
        params: {
            locale: lng,
        },
    }))
);

export const getStaticPaths: GetStaticPaths = async () => {
    const blogs = await getBlogs();

    const pathsWithParams = blogs.flatMap((blog) => {
        const withLocales = i18nextConfig.i18n.locales.map((lng) => ({
            params: {
                slug: blog.name,
                locale: lng,
            },
        }));
        return withLocales;
    });

    return {
        paths: pathsWithParams,
        fallback: false,
    };
};

export const getStaticProps: GetStaticProps<Props> = async (context) => {
    const locale = context?.params?.locale;
    const blogSlug = context?.params?.slug;
    const blogs = await getBlogs();

    const translations = await serverSideTranslations(locale as string, [
        'blog',
        'common',
    ]);

    const selectedBlog = blogs.find((blog) => blog.name === blogSlug);
    if (!selectedBlog) {
        throw new Error(`Could not find the current blog ${blogSlug}.`);
    }

    const processedContent = await remark()
        .use(html, { sanitize: false })
        .use(remarkGfm)
        .process(selectedBlog.markdownContent);
    const contentHtml = processedContent.toString();

    return {
        props: {
            ...translations,
            blog: selectedBlog,
            contentHtml,
        },
    };
};

export default Blog;
