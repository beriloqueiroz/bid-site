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
          é simplificar e otimizar a operação de entregas por meio de soluções inteligentes. Almejamos a
          {' '}
          <strong>Visão</strong>
          de ser reconhecidos como referência em entregas rápidas,
          confiáveis e eficientes em Fortaleza. Para alcançar esse objetivo, norteamos nossas ações pelos
          {' '}
          <strong>Valores</strong>
          de respeito, honestidade, cordialidade, inteligência e agilidade.
        </p>
        <h2>Onde atuamos</h2>
        <p>
          Atendemos a capital e toda a região metropolitana de
          {' '}
          <strong>Fortaleza</strong>
          {' '}
          com nossos serviços de entregas.
        </p>
        <h2>A quem atendemos</h2>
        <p>
          Oferecemos soluções de entrega para e-commerces, lojas virtuais ou demais negócios que buscam
          <strong> simplificar</strong>
          {' '}
          suas operações logísticas.
        </p>
        <h2>Como trabalhamos</h2>
        <p>
          Contamos com uma equipe de entregadores
          {' '}
          <strong>altamente treinados</strong>
          , experientes e especializados na região em que atuamos. Aliando seus conhecimentos ao nosso sistema
          <strong> inteligente</strong>
          {' '}
          de rotas e acompanhamento, garantimos a
          {' '}
          <strong>eficiência</strong>
          , velocidade e um
          {' '}
          <strong>preço competitivo</strong>
          em nossos serviços de entrega.
          Oferecemos serviços de entrega D+1, expressa e logística reversa para
          atender às necessidades de sua empresa. Realizamos a coleta das encomendas
          diretamente em seu centro de distribuição, de forma prática e simplificada. Além disso,
          oferecemos valores acessíveis para que você possa oferecer aos seus clientes preços e prazos atrativos,
          {' '}
          <strong>aumentando suas vendas</strong>
          .
        </p>
      </div>
    </section>
  );
}
