import Head from "next/head";
import { Inter } from "@next/font/google";
import homeStyles from "@/styles/home.module.scss";
import Header from "@/components/header";
import ContactForm from "@/components/contactForm";
import Footer from "@/components/footer";
import banner from "/short_apresentation.gif";
const inter = Inter({ subsets: ["latin"] });
export default function Home() {
  return (
    <>
      <Head>
        <title>bid</title>
        <meta name='description' content='bid site' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Header />
      <main className={homeStyles.main}>
        <section
          className={`${homeStyles.section} ${homeStyles.apresentation}`}>
          <div className={homeStyles.apresentationContent}>
            <h1 className={homeStyles.apresentationTitle}>
              Bom, Inteligente e Direto, Simples assim!
            </h1>
            <p className={homeStyles.apresentationDescription}>
              A bid é entrega sem complicação, de forma rápida e inteligente,
              reunimos e treinamos entregadores de confiança, para proporcionar
              um preço justo pra não dizer barato demais, e uma entrega rápida.
            </p>
            <div className={homeStyles.buttons}>
              <button className={homeStyles.buttonAbout}>
                ENTRE EM CONTATO
              </button>
              <button className={homeStyles.buttonAbout}>MAIS SOBRE NÓS</button>
            </div>
          </div>
          <img src='/short_apresentation.gif' alt='apresentação' />
        </section>
      </main>
    </>
  );
}
