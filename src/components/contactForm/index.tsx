/* eslint-disable no-useless-escape */
import { ChangeEvent, useState } from 'react';

import styles from '@/components/contactForm/style.module.scss';

import Button from '../button';
import * as ga4 from '../google/ga4lib';
import InputForm from '../inputForm';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [geralError, setGeralError] = useState(false);
  const [requiredError, setRequiredError] = useState(false);
  const [errorEmail, setErrorEmail] = useState(false);
  const [errorPhone, setErrorPhone] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function onChangeEmail(e: ChangeEvent<HTMLInputElement>) {
    setErrorEmail(false);
    setEmail(e.target.value);
    setSubmitted(false);
  }
  function onChangePhone(e: ChangeEvent<HTMLInputElement>) {
    setErrorPhone(false);
    setSubmitted(false);
    const { value } = e.target;
    if (value.length > 14) {
      return;
    }
    setPhone(value);

    if (value.length > 0 && value.length < 10 && value.indexOf('(') >= 0) { setPhone(value.replaceAll('(', '').replaceAll(') ', '')); } else
    if (value.length === 10 && value.indexOf('(') < 0) {
      const ddd = value.substring(0, 2);
      const number = value.substring(2, value.length);
      setPhone(`(${ddd}) ${number}`);
    }
  }

  function onChangeName(e: ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
    setSubmitted(false);
  }
  function onChangeMessage(e: ChangeEvent<HTMLInputElement>) {
    setMessage(e.target.value);
    setSubmitted(false);
  }

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setSending(true);
    setGeralError(false);
    setRequiredError(false);
    setErrorEmail(false);
    setErrorPhone(false);

    const data = {
      name,
      email,
      message,
      phone,
    };
    if (name === '' || email === '' || phone === '') {
      setRequiredError(true);
      setSending(false);
      setErrorMessage('preencha todos os campos obrigatórios, os campos obrigatórios possuem *');
      return;
    }
    const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!re.test(email)) {
      setErrorEmail(true);
      setSending(false);
      setErrorMessage('email inválido');
      return;
    }
    if (phone.length < 13 || phone.length > 14) {
      setErrorPhone(true);
      setSending(false);
      setErrorMessage('telefone inválido');
      return;
    }
    fetch('/api/mail', {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((res) => {
      if (res.status === 200) {
        setSubmitted(true);
        setName('');
        setEmail('');
        setMessage('');
        setPhone('');
        ga4.event({ action: 'lead_form', params: {} });
      } else {
        setGeralError(true);
      }
      setSending(false);
    });
  };

  return (
    <>
      <div id="contato">
        <br />
        <br />
      </div>
      <br />
      <br />
      <br />
      <br />
      <section className={styles.container}>
        <div>
          <h1 className={styles.title}>Fale conosco</h1>
          <form className={styles.form}>
            <InputForm
              label="Nome*"
              type="text"
              name="name"
              id="name"
              placeholder="João da Silva"
              isRequired
              alertRequired={requiredError && name === ''}
              onChange={onChangeName}
              value={name}
            />
            <InputForm
              label="E-mail*"
              type="email"
              name="email"
              id="email"
              placeholder="email@gmail.com"
              isRequired
              alertRequired={(requiredError && email === '') || errorEmail}
              onChange={onChangeEmail}
              value={email}
            />
            <InputForm
              label="Telefone*"
              type="tel"
              name="phone"
              id="phone"
              placeholder="(85) 88888888"
              alertRequired={(requiredError && phone === '') || errorPhone}
              isRequired
              onChange={onChangePhone}
              value={phone}
            />
            <InputForm
              label="Mensagem"
              name="mensagem"
              id="message"
              placeholder="Olá, gostaria de solicitar uma ..."
              onChange={onChangeMessage}
              value={message}
              isTextArea
            />
            <Button sending={sending} handleSubmit={handleSubmit} type="submit" />
            {!sending && (
              requiredError || errorEmail || errorPhone ? <span className={styles.errorMessage}>{errorMessage}</span>
                : geralError && (
                <span className={styles.errorMessage}>
                  Desculpe Erro ao enviar mensagem, tente por outro canal
                  {' '}
                  (
                  Whatsapp, telefone
                  )
                </span>
                ))}
            {submitted && !geralError && (
            <span className={styles.successMessage}>
              Sucesso ao enviar informações. Em breve entraremos em contato.
            </span>
            )}
          </form>
        </div>
      </section>
    </>
  );
}
