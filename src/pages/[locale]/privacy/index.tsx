import React from 'react';
import { GetStaticProps } from 'next';
import { useTranslation, SSRConfig } from 'next-i18next';
import { _cs } from '@togglecorp/fujs';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import matter from 'gray-matter';
import html from 'remark-html';
import Head from 'next/head';

import Page from 'components/Page';
import Hero from 'components/Hero';
import Section from 'components/Section';
import HtmlOutput from 'components/HtmlOutput';

import i18nextConfig from '../../../../next-i18next.config';

import styles from './styles.module.css';

const policy = `
We are committed to protecting your personal information and being transparent about what we do with it. We are committed to using your personal information in accordance with our responsibilities. We are required to provide you with the information in this Privacy Notice under applicable law which includes:

* UK GDPR; the Data Protection Act 2018 (DPA 2018) (and regulations made thereunder) referred to as the 'data protection legislation'
* the Privacy and Electronic Communications Regulation (2003)

We won't do anything with your information you wouldn't reasonably expect.

Processing of your personal information is carried out by or on behalf of the British Red Cross Society, incorporated by Royal Charter 1908; registered as a charity in England and Wales (220949), Scotland (SC037738) and the Isle of Man (0752).

If you have any queries about our Privacy Notice, please get in touch with our Information Governance team:

| | |
| ------- | ---------------- |
| Email | [dataprotection@redcross.org.uk](mailto:dataprotection@redcross.org.uk) |
| Phone | 0344 871 1111 |
| Post | Head of Information Governance, British Red Cross, 44 Moorfields London, EC2Y 9AL |

## How and when we collect information about you
### When you directly give us information
When you download the MapSwipe app, you will have to create an account and provide us with some information about you so that we can link your contributions to your account. We are hoping to introduce an option to map as a guest without you having to give us any information, however this is not yet available.

### When you indirectly give us information
We monitor how the app is used, for example the pages you view and how you navigate the app, to help us improve the experience. This data is aggregated and anonymised, so we are not able to identify individual users.

### What information we might collect
When you create an account, we will ask you to provide your email address and create a username and password for your account. If you use your OpenStreetMap account to signup or login, we will instead obtain your user identifier and username from OpenStreetMap. Your email address and OpenStreetMap identifier are referred to in this Privacy Notice as 'personal information', whereas your username will be publicly visible and tied to your contributions in the app. Your password is encrypted and not visible to anyone.

### If you're under 16
If you're aged under 16, you must get your parent/guardian's permission before you provide any personal information to us.

### How and why we use your information
Your personal information is only used for the purpose of logging into your account or resetting your password. We do not use it for any other purpose including marketing or contacting you in any way.

### Who do we share your information with?
We will only use your information for the purposes for which it was obtained. We will not, under any circumstances, sell or share your personal information with any third party for their own purposes, and you will not receive marketing from any other companies, charities or other organisations as a result of giving your details to us.

### How we protect your information
We use technical and corporate organisational safeguards to ensure that your personal information is secure. We limit access to information on a need-to-know basis and take appropriate measures to ensure that our people are aware that such information is only used in accordance with this Privacy Notice.

We undertake regular reviews of who has access to information that we hold to ensure that your information is only accessible by appropriately trained staff and volunteers.

However, please be aware that there are always inherent risks in sending information by public networks or using public computers and we cannot 100% guarantee the security of data (including personal information) disclosed or transmitted over public networks.

### How long will we keep your information?
We will keep your personal information for as long as you use the MapSwipe app. After two years of inactivity on your account (i.e. you have not logged in or opened the app), we will delete your account and all personal information. Your contributions will remain in our database but will no longer be linked to your public username or personal information.

### International transfers of information
Our servers are located in the US, which means that your personal information is transferred, processed and stored outside the EEA. You should be aware that, in general, legal protection for personal information in countries outside the EEA may not be equivalent to the level of protection provided in the EEA.

However, we take steps to put in place suitable safeguards to protect your personal information when processed by the supplier such as entering into the European Commission approved standard contractual clauses. By submitting your personal information to us you agree to this transfer, storing or processing at a location outside the EEA.

### Your rights to your personal information
Data protection legislation gives you the right to erase the personal information about you which is collected through MapSwipe and processed by the British Red Cross.

This can be done within the app by selecting the option to 'Delete my account' at the bottom of your account profile page. This will remove all of your personal data from our servers and unlink your map contributions from your public username, which will also be deleted.

### How to make a complaint or raise a concern
If you would like more information, or have any questions about this policy, to make a formal complaint about our approach to data protection or raise privacy concerns please contact the Information Governance Team:

| | |
| ------- | ---------------- |
| Email | [dataprotection@redcross.org.uk](mailto:dataprotection@redcross.org.uk) |
| Phone | 0344 871 1111 |
| Post | Head of Information Governance, British Red Cross, 44 Moorfields London, EC2Y 9AL |

If you are not happy with the response you receive, then you can raise your concern with the relevant statutory body:
Information Commissioner's Office, Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF


Alternatively you can [visit their website](https://ico.org.uk/).

We are registered with the Information Commissioner's Office as a Data Controller under number Z5379882.

### Changes to our Privacy Notice
Our Privacy Notice may change from time to time, so please check this page occasionally to see if we have included any updates or changes, and that you are happy with them. (Last updated: 24 May 2022)
`;

interface Props extends SSRConfig {
    className?: string;
    policyContent: string;
}

function GetInvolved(props: Props) {
    const {
        className,
        policyContent,
    } = props;

    const { t } = useTranslation('privacy');

    return (
        <Page contentClassName={_cs(styles.privacy, className)}>
            <Head>
                <title>{t('privacy-tab-head')}</title>
                <meta property="og:title" content={String(t('privacy-tab-head'))} />
                <meta property="twitter:title" content={String(t('privacy-tab-head'))} />
            </Head>
            <Hero
                className={styles.hero}
                title={t('privacy-hero-title')}
            />
            <Section
                contentClassName={styles.content}
            >
                <HtmlOutput
                    content={policyContent}
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

export const getStaticPaths = () => ({
    fallback: false,
    paths: getI18nPaths(),
});

export const getStaticProps: GetStaticProps<Props> = async (context) => {
    const locale = context?.params?.locale;
    const translations = await serverSideTranslations(locale as string, [
        'privacy',
        'common',
    ]);
    const matterResult = matter(policy);

    const processedContent = await remark()
        .use(html)
        .use(remarkGfm)
        .process(matterResult.content.replace(/\\n/g, '\n'));
    const contentHtml = processedContent.toString();
    return {
        props: {
            ...translations,
            policyContent: contentHtml,
        },
    };
};

export default GetInvolved;
