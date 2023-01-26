import styles from "@/components/contactForm/style.module.scss";

export default function ContactForm() {
  return (
    <section className={styles.container} id='contato'>
      <div>
        <h1 className={styles.title}>Fale conosco</h1>
        <form action='' method='post' className={styles.form}>
          <label htmlFor='name'>nome: </label>
          <input
            type='text'
            name='name'
            id='name'
            placeholder='joão da silva'
            required
          />
          <label htmlFor='email'>e-mail: </label>
          <input
            type='email'
            name='email'
            id='email'
            placeholder='email@gmail.com'
            required
          />
          <label htmlFor='telefone'>telefone: </label>
          <input
            type='tel'
            name='phone'
            id='phone'
            placeholder='(85) 88888888'
            required
          />
          <label htmlFor='message'>mensagem: </label>
          <textarea
            name='mensagem'
            id='message'
            placeholder='Olá, gostaria e fazer uma cotação...'></textarea>
          <button type='submit'>Enviar</button>
        </form>
      </div>
    </section>
  );
}
