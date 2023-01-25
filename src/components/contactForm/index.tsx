import formStyle from "@/components/contactForm/style.module.scss";

export default function ContactForm() {
  return (
    <>
      <h1 className={formStyle.title}>Contato</h1>
      <form action='' method='post' className={formStyle.formContainer}>
        <label htmlFor='name'>nome: </label>
        <input
          type='text'
          name='name'
          id='name'
          placeholder='fulano de tal'
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
        <label htmlFor='message'>mensagem: </label>
        <textarea name='mensagem' id='message'></textarea>
        <button type='submit'>Enviar</button>
      </form>
    </>
  );
}
