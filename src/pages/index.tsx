import Head from "next/head";
import { Inter } from "@next/font/google";
import styles from "@/styles/home.module.scss";
import Header from "@/components/header";
import ContactForm from "@/components/contactForm";
import Footer from "@/components/footer";
import Presentation from "@/components/presentation";
import About from "@/components/about";
const inter = Inter({ subsets: ["latin"] });
export default function Home() {
  const GA_TRACKING_ID = "G-BDL6T80L70";
  return (
    <>
      <Head>
        <title>bid</title>
        <meta name='description' content='bid site' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.svg' />
        {/* Global Site Tag (gtag.js) - Google Analytics */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
          }}
        />
      </Head>
      <Header />
      <main className={styles.main}>
        <Presentation />
        <About />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
