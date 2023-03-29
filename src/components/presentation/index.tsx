import styles from '@/components/presentation/style.module.scss';
import { useRouter } from 'next/router';

import Video from './video';

export default function Presentation() {
  const router = useRouter();

  return (
    <section className={`${styles.section} ${styles.presentation}`}>
      <div className={styles.presentationContent}>
        <h1 className={styles.presentationTitle}>
          bom, inteligente e direto.
          <br />
          {' '}
          <span>Simples assim!</span>
        </h1>
        <div className={styles.banner}>
          <Video />
        </div>
        <p className={styles.presentationDescription}>
          A bid é a solução de entrega que você precisa para o seu negócio:
          {' '}
          <strong>prática, rápida e inteligente</strong>
          .
          Selecionamos e treinamos cuidadosamente nossa equipe de entregadores, garantindo a confiança e a
          qualidade do serviço prestado. Além disso, oferecemos
          {' '}
          <strong>preços</strong>
          {' '}
          justos e
          {' '}
          <strong>competitivos</strong>
          {' '}
          para que você possa realizar suas entregas sem preocupações. Conte conosco para uma entrega rápida e eficiente.

        </p>
        <div className={styles.buttons}>
          <button type="button" className={styles.buttonAbout} onClick={() => router.push('/#contato')}>
            ENTRE EM CONTATO
          </button>
          <button type="button" className={styles.buttonAbout} onClick={() => router.push('/#sobre')}>
            MAIS SOBRE NÓS
          </button>
        </div>
      </div>
    </section>
  );
}
