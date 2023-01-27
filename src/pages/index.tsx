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
  return (
    <>
      <Head>
        <title>bid</title>
        <meta name='description' content='bid site' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.svg' />
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
