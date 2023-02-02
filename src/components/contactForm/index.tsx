import styles from "@/components/contactForm/style.module.scss";
import { useState } from "react";
import * as ga4 from "../google/ga4lib";
import InputForm from "../inputForm";

import SubmitButton from "../submitButton";

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
      if (res.status === 200) {
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
        <form className={styles.form}>
          <InputForm
            label='nome'
            type='text'
            name='name'
            id='name'
            placeholder='João da Silva'
            isRequired={true}
            setOnChange={setName}
            value={name}
          />
          <InputForm
            label='e-mail'
            type='email'
            name='email'
            id='email'
            placeholder='email@gmail.com'
            isRequired={true}
            setOnChange={setEmail}
            value={email}
          />
          <InputForm
            label='telefone'
            type='tel'
            name='phone'
            id='phone'
            placeholder='(85) 88888888'
            isRequired={true}
            setOnChange={setPhone}
            value={phone}
          />
          <InputForm
            label='mensagem'
            name='mensagem'
            id='message'
            placeholder='Olá, gostaria de solicitar uma ...'
            setOnChange={setMessage}
            value={message}
            isTextArea={true}
          />
          <SubmitButton sending={sending} handleSubmit={handleSubmit} />
          {!sending && error && (
            <span className={styles.errorMessage}>
              Desculpe Erro ao enviar mensagem, tente por outro canal (Whatsapp,
              telefone)
            </span>
          )}
          {submitted && !error && (
            <span className={styles.successMessage}>
              Sucesso ao enviar informações. Bm breve entraremos em contato.
            </span>
          )}
        </form>
      </div>
    </section>
  );
}
