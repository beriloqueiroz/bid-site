import styles from "@/components/presentation/style.module.scss";
import { useRouter } from "next/router";
export default function Presentation() {
  const router = useRouter();

  return (
    <section className={`${styles.section} ${styles.presentation}`}>
      <div className={styles.presentationContent}>
        <h1 className={styles.presentationTitle}>
          Bom, Inteligente e Direto, Simples assim!
        </h1>
        <div className={styles.banner}>
          {/* <video
            src='/short_presentation.webm'
            typeof='video/webm'
            title='Apresentação da bid'
            autoPlay
            muted
            loop
          /> */}
          <img src='/short_presentation.gif' alt='video de apresentação' />
        </div>
        <p className={styles.presentationDescription}>
          A bid é entrega sem complicação, de forma <strong>rápida</strong> e{" "}
          <strong>inteligente</strong>. Reunimos e treinamos entregadores de
          confiança para proporcionar um <strong>preço</strong> justo, pra não
          dizer <strong>barato</strong>, e uma entrega rápida.
        </p>
        <div className={styles.buttons}>
          <button
            className={styles.buttonAbout}
            onClick={() => router.push("#contato")}>
            ENTRE EM CONTATO
          </button>
          <button
            className={styles.buttonAbout}
            onClick={() => router.push("#sobre")}>
            MAIS SOBRE NÓS
          </button>
        </div>
      </div>
    </section>
  );
}
