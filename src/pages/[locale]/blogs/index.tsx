import React, { useMemo } from 'react';
import { GetStaticProps } from 'next';
import { useTranslation, SSRConfig } from 'next-i18next';
import {
    _cs,
    compareDate,
} from '@togglecorp/fujs';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { IoCalendarClearOutline } from 'react-icons/io5';

import Link from 'components/Link';
import Tag from 'components/Tag';
import Card from 'components/Card';
import Page from 'components/Page';
import Hero from 'components/Hero';
import Section from 'components/Section';
import getBlogs, { Blog } from 'utils/requests/getBlogs';
import OgMeta from 'components/OgMeta';

import i18nextConfig from '../../../../next-i18next.config';

import styles from './styles.module.css';

interface Props extends SSRConfig {
    className?: string;
    blogs: Omit<Blog, 'markdownContent'>[];
}

function Blogs(props: Props) {
    const {
        className,
        blogs,
    } = props;

    const { t } = useTranslation('blogs');

    const featuredBlogs = useMemo(
        () => blogs.filter((blog) => blog.featured),
        [blogs],
    );

    const otherBlogs = useMemo(
        () => blogs.filter((blog) => !blog.featured),
        [blogs],
    );

    return (
        <Page contentClassName={_cs(styles.blogs, className)}>
            <OgMeta
                title={String(t('blogs-tab-head'))}
            />
            <Hero
                title={t('blogs-hero-title')}
            />
            {featuredBlogs.length > 0 && (
                <Section
                    title={t('featured-posts')}
                    contentClassName={styles.list}
                >
                    {featuredBlogs.map((blog) => (
                        <Card
                            key={blog.name}
                            heading={blog.title}
                            coverImageUrl={blog.coverImage}
                            childrenContainerClassName={styles.cardContent}
                            coverImageOnSide
                        >
                            <Tag
                                className={styles.tag}
                                icon={<IoCalendarClearOutline />}
                                variant="transparent"
                            >
                                {t('date', { date: blog.publishedDate })}
                            </Tag>
                            <div className={styles.description}>{blog.description}</div>
                            <Link
                                className={styles.link}
                                href={`/[locale]/blogs/${blog.name}`}
                            >
                                {t('read-more')}
                            </Link>
                        </Card>
                    ))}
                </Section>
            )}
            {otherBlogs.length > 0 && (
                <Section
                    title={t('other-posts')}
                    contentClassName={styles.list}
                >
                    {otherBlogs.map((blog) => (
                        <Card
                            key={blog.name}
                            heading={blog.title}
                            coverImageUrl={blog.coverImage}
                            description={(
                                <Tag
                                    className={styles.tag}
                                    icon={<IoCalendarClearOutline />}
                                    variant="transparent"
                                >
                                    {t('date', { date: blog.publishedDate })}
                                </Tag>
                            )}
                            childrenContainerClassName={styles.cardContent}
                            coverImageOnSide
                        >
                            <div className={styles.description}>{blog.description}</div>
                            <Link
                                className={styles.link}
                                href={`/[locale]/blogs/${blog.name}`}
                            >
                                Read more
                            </Link>
                        </Card>
                    ))}
                </Section>
            )}
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

export const getStaticPaths = () => ({
    fallback: false,
    paths: getI18nPaths(),
});

export const getStaticProps: GetStaticProps<Props> = async (context) => {
    const locale = context?.params?.locale;
    const translations = await serverSideTranslations(locale as string, [
        'blogs',
        'common',
    ]);
    const blogs = await getBlogs();

    const finalBlogs = blogs.map((blog) => ({
        name: blog.name,
        title: blog.title,
        publishedDate: blog.publishedDate,
        description: blog.description,
        author: blog.author,
        coverImage: blog.coverImage,
        featured: blog.featured,
    }));

    const sortedBlogs = [...finalBlogs]
        .sort((foo, bar) => compareDate(foo.publishedDate, bar.publishedDate, -1));

    return {
        props: {
            ...translations,
            blogs: sortedBlogs,
        },
    };
};

export default Blogs;
