import styles from "@/components/presentation/style.module.scss";
import { useRouter } from "next/router";
export default function Presentation() {
  const router = useRouter();

  return (
    <section className={`${styles.section} ${styles.presentation}`}>
      <div className={styles.presentationContent}>
        <h1 className={styles.presentationTitle}>
          bom, inteligente e direto.
          <br /> <span>Simples assim!</span>
        </h1>
        <div className={styles.banner}>
          <video
            title='Apresentação da bid'
            muted
            autoPlay
            loop
            playsInline
            preload='auto'>
            <source src='/short_presentation.mp4' type='video/mp4' />
          </video>
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
