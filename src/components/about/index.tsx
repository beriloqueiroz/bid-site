import styles from '@/components/about/style.module.scss';

export default function About() {
  return (
    <section className={styles.container} id="sobre">
      <br />
      <br />
      <div className={styles.content}>
        <h1>Sobre Nós</h1>
        <p>
          Nossa
          {' '}
          <strong>Missão</strong>
          {' '}
          é proporcionar a operação de entregas de forma simples e inteligente. Temos como
          {' '}
          <strong>Visão</strong>
          :
          tornar-se uma referência em entregas rápidas, confiáveis e eficientes para empresas em Fortaleza, tendo como
          {' '}
          <strong>Valores</strong>
          :
          respeito, honestidade, cordialidade, inteligência e agilidade.
        </p>
        <h2>Onde estamos</h2>
        <p>
          Estamos em
          {' '}
          <strong>Fortaleza</strong>
          {' '}
          e entregamos em toda capital e região metropolitana.
        </p>
        <h2>A quem atendemos</h2>
        <p>
          Atendemos à empresas, e-commerces/lojas virtuais que desejam
          <strong> simplificar</strong>
          {' '}
          a operação com entrega em Fortaleza e região metropolitana.
        </p>
        <h2>Como trabalhamos</h2>
        <p>
          Possuímos entregadores
          {' '}
          <strong>treinados</strong>
          , experientes e especialistas na região que atuamos. Através deles e de um sistema
          <strong> inteligente</strong>
          {' '}
          de rotas e acompanhamento, conseguimos obter
          {' '}
          <strong>eficiência</strong>
          , velocidade e um
          {' '}
          <strong>preço incrível</strong>
          . Nosso entregador coleta na sua empresa as encomendas/pedidos no final da tarde e entrega no dia seguinte.
          Sem complicação e sem dor de cabeça. E claro, você nos paga um preço mais barato do que o normal. Assim oferece preço e prazo para seu
          cliente,
          {' '}
          <strong>aumenta as vendas</strong>
          {' '}
          e todo mundo ganha.
        </p>
      </div>
    </section>
  );
}
