import styles from "@/components/about/style.module.scss";

export default function About() {
  return (
    <section className={styles.container} id='sobre'>
      <div className={styles.content}>
        <h1>Sobre Nós</h1>
        <h2>Missão, Visão, Valores</h2>
        <h2>Onde estamos</h2>
        <h2>A quem atendemos</h2>
        <h2>Como trabalhamos</h2>
      </div>
    </section>
  );
}
