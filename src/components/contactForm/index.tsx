import styles from "@/components/contactForm/style.module.scss";
import { useState } from "react";
import * as ga4 from "../google/ga4lib";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("Sending");
    setSending(true);
    setError(false);
    let data = {
      name,
      email,
      message,
      phone,
    };
    fetch("/api/mail", {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((res) => {
      console.log("Response received");
      if (res.status === 200) {
        console.log("Response succeeded!");
        setSubmitted(true);
        setName("");
        setEmail("");
        setMessage("");
        setPhone("");
        ga4.event({ action: "lead_form", params: {} });
      } else {
        setError(true);
      }
      setSending(false);
    });
  };

  return (
    <section className={styles.container} id='contato'>
      <div>
        <h1 className={styles.title}>Fale conosco</h1>
        <form action='/api/mail' method='post' className={styles.form}>
          <label htmlFor='name'>nome: </label>
          <input
            type='text'
            name='name'
            id='name'
            placeholder='joão da silva'
            required
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
          <label htmlFor='email'>e-mail: </label>
          <input
            type='email'
            name='email'
            id='email'
            placeholder='email@gmail.com'
            required
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
          <label htmlFor='telefone'>telefone: </label>
          <input
            type='tel'
            name='phone'
            id='phone'
            placeholder='(85) 88888888'
            required
            onChange={(e) => setPhone(e.target.value)}
            value={phone}
          />
          <label htmlFor='message'>mensagem: </label>
          <textarea
            name='mensagem'
            id='message'
            placeholder='Olá, gostaria e fazer uma cotação...'
            onChange={(e) => setMessage(e.target.value)}
            value={message}
          />
          <button type='submit' onClick={(e) => handleSubmit(e)}>
            {!sending ? "Enviar" : <div className={styles.loading}></div>}
          </button>
          {!sending && error && (
            <span className={styles.errorMessage}>
              Desculpe Erro ao enviar mensagem, tente por outro canal (Whatsapp,
              telefone)
            </span>
          )}
        </form>
      </div>
    </section>
  );
}
