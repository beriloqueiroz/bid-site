import styles from "@/components/presentation/style.module.scss";
import { useRouter } from "next/router";
import Video from "./video";
// import React from "react";
// const LazyVideo = React.lazy(() => import("./video"));
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
          <Video />
        </div>
        <p className={styles.presentationDescription}>
          A bid é entrega sem complicação, de forma <strong>rápida</strong> e <strong>inteligente</strong>. Reunimos e treinamos entregadores de
          confiança para proporcionar um <strong>preço</strong> justo, pra não dizer <strong>barato</strong>, e uma entrega rápida.
        </p>
        <div className={styles.buttons}>
          <button className={styles.buttonAbout} onClick={() => router.push("/#contato")}>
            ENTRE EM CONTATO
          </button>
          <button className={styles.buttonAbout} onClick={() => router.push("/#sobre")}>
            MAIS SOBRE NÓS
          </button>
        </div>
      </div>
    </section>
  );
}
