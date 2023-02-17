import { ReactNode } from 'react';

import Head from 'next/head';

import Footer from '../footer';
import GoogleAnalytics from '../google/ga4Tag';
import Header from '../header';
import styles from './style.module.scss';

interface Props {
  children: ReactNode;
  simpleHeader?: boolean;
}

export default function Layout(props: Props) {
  return (
    <>
      <Head>
        <title>bid</title>
        <meta name="description" content="bid site" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" />
        <GoogleAnalytics />
      </Head>
      <Header />
      <main className={styles.main}>{props.children}</main>
      <Footer />
    </>
  );
}
