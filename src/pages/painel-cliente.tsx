/* eslint-disable react-hooks/exhaustive-deps */
import {
  ChangeEvent, KeyboardEvent, useState,
} from 'react';

import Button from '@/components/button';
import InputForm from '@/components/inputForm';
import { OptionSelect } from '@/components/inputForm/props';
import Layout from '@/components/layout';
import ToggleButton from '@/components/toggleButton';
import { useRouter } from 'next/router';

import { useApply, useReducers } from '@/lib/redux/hooks';
import LoginForm from '@/components/login';
import style from '../styles/painel-cliente.module.scss';
import { ResponseCepApi } from './api/getInfosByCep';
import { ResponseSendTaskApi } from './api/sendTask';
import { ResponseUploadApi } from './api/upload';

export default function CustomerPanel() {
  const {
    isLogged, userName, token, client, hasError,
  } = useReducers('user.isLogged', 'user.userName', 'user.token', 'client', 'error.hasError');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSelected, setFileSelected] = useState<File | null>();
  const [requiredError, setRequiredError] = useState(false);

  const [sendingIndividual, setSendingIndividual] = useState(false);
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [reference, setReference] = useState('');
  const [complement, setComplement] = useState('');
  const [number, setNumber] = useState('');
  const [order, setOrder] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [recipient, setRecipient] = useState('');
  const [type, setType] = useState('');
  const [price, setPrice] = useState('10');
  const [valueDeclared, setValueDeclared] = useState(0);

  const [inLote, setInLote] = useState(false);
  const [optionsSelect] = useState<OptionSelect[]>([
    { value: '', content: 'SELECIONE' },
    { value: 'D+1', content: 'ENTREGA NO PRÓXIMO DIA ÚTIL' },
    { value: 'D', content: 'ENTREGA NO MESMO DIA' },
  ]);
  const apply = useApply();

  function clearLogin() {
    window.sessionStorage.removeItem('token');
    window.sessionStorage.removeItem('userid');
    window.sessionStorage.removeItem('username');
    apply('user', { isLogged: false, userName: '', identification: '' });
  }

  function calculePrice(value:number, typeSelected:string, citySelected: string) {
    let base = 10;
    if (typeSelected === 'D') {
      if (citySelected.toLowerCase() === 'fortaleza') {
        base = client.prices.capital.d;
      } else { base = client.prices.metropolitana.d; }
    }
    if (typeSelected === 'D+1') {
      if (citySelected.toLowerCase() === 'fortaleza') {
        base = client.prices.capital.d1;
      } else { base = client.prices.metropolitana.d1; }
    }
    if (value < 200) return base;
    return (base * value) / 200;
  }

  const router = useRouter();

  const onCancelFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!fileSelected) {
      return;
    }
    setFileSelected(null);
    setFileName('');
    setSending(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    apply('error', { hasError: false, message: '' });
    if (!fileList || !fileList[0]) {
      apply('error', { hasError: true, message: 'Erro ao selecionar arquivo!' });
      return;
    }
    setFileSelected(fileList[0]);
    setFileName(fileList[0].name);
  };

  const handleSubmit = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();
    apply('error', { hasError: false, message: '' });

    if (!fileSelected) {
      apply('error', { hasError: true, message: 'Arquivo não selecionado!' });
      return;
    }

    if (userName === '' || token === '' || !isLogged) {
      apply('error', { hasError: true, message: 'Credenciais não informadas' });
      clearLogin();
      return;
    }

    setSending(true);
    apply('error', { hasError: false, message: '' });

    try {
      const formData = new FormData();
      formData.append('media', fileSelected);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'x-username': window.sessionStorage.getItem('username') || userName || '',
          'x-token': window.sessionStorage.getItem('token') || token || '',
        },
      });

      const { status, error }: ResponseUploadApi = await res.json();

      if (status === 401) {
        apply('error', { hasError: true, message: 'Erro de autenticação' });
        clearLogin();
        setSending(false);
        return;
      }

      if (status !== 200) {
        apply('error', { hasError: true, message: `Erro ${error}` });
        setSending(false);
        return;
      }

      setSubmitted(true);
    } catch (error) {
      apply('error', { hasError: true, message: `Erro ${error}` });
    }
    setSending(false);
    setFileSelected(null);
    setFileName('');
  };

  async function downloadModel(e: React.MouseEvent) {
    e.preventDefault();
    try {
      setDownloading(true);
      const res = await fetch('/api/authenticate', {
        method: 'GET',
        headers: {
          'x-username': window.sessionStorage.getItem('username') || userName || '',
          'x-token': window.sessionStorage.getItem('token') || token || '',
        },
      });

      const {
        status,
        error,
      }: {
        status: number;
        error: string | null;
      } = await res.json();

      if (status === 401) {
        apply('error', { hasError: true, message: `Erro de autenticação ${error}` });
        clearLogin();
        return;
      }

      if (status !== 200) {
        apply('error', { hasError: true, message: 'Erro de execução' });
        setDownloading(false);
        return;
      }
      router.push('/model.csv');
      setDownloading(false);
    } catch (err) {
      apply('error', { hasError: true, message: `${err}` });
    }
  }

  const handleKeypress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  function isNumber(value: string) {
    if (typeof value === 'string') {
      return !Number.isNaN(Number(value));
    }
    return false;
  }

  const getInfosByCep = async (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => {
    if (!isNumber(e.target.value.slice(-1)) && e.target.value.length > 0) {
      return;
    }
    if (e.target.value.length >= 9) {
      return;
    }
    setCep(e.target.value);
    if (e.target.value.length >= 8) {
      try {
        const res = await fetch(`/api/getInfosByCep?cep=${e.target.value}`, {
          method: 'GET',
          headers: {
            'x-username': window.sessionStorage.getItem('username') || userName || '',
            'x-token': window.sessionStorage.getItem('token') || token || '',
          },
        });

        const { status, error, content }: ResponseCepApi = await res.json();

        if (status === 401) {
          apply('error', { hasError: true, message: `Erro de autenticação ${error}` });
          clearLogin();
          return;
        }

        if (!content) {
          apply('error', { hasError: true, message: `Erro  ${error}` });
          return;
        }

        setStreet(content.rua);
        setNeighborhood(content.bairro);
        setCity(content.cidade);
        setState(content.estado);
        setPrice(calculePrice(valueDeclared, type, content.cidade).toString());
      } catch (error) {
        apply('error', { hasError: true, message: `${error}` });
      }
    } else {
      setStreet('');
      setNeighborhood('');
      setCity('');
      setState('');
    }
  };

  const individualHandleSubmit = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();
    setRequiredError(false);

    try {
      if (userName === '' || token === '' || !isLogged) {
        apply('error', { hasError: true, message: 'Credenciais não informadas' });
        clearLogin();
        return;
      }

      if (street === '' || number === '' || neighborhood === '' || city === '' || state === '' || cep === '' || type === '') {
        apply('error', { hasError: true, message: 'preencha todos os campos obrigatórios, os campos obrigatórios possuem *' });
        setRequiredError(true);
        return;
      }

      setSendingIndividual(true);
      apply('error', { hasError: false, message: '' });

      const data = {
        street,
        number,
        neighborhood,
        city,
        state,
        cep,
        complement,
        reference,
        phone,
        recipient,
        deliveryType: type,
      };
      const res = await fetch('/api/sendTask', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'x-username': window.sessionStorage.getItem('username') || userName || '',
          'x-token': window.sessionStorage.getItem('token') || token || '',
        },
      });

      const response: ResponseSendTaskApi = await res.json();

      if (response.status === 401) {
        apply('error', { hasError: true, message: 'Erro de autenticação' });
        clearLogin();
        return;
      }

      if (!response.content) {
        apply('error', { hasError: true, message: `Erro ao enviar pacote ${response?.error}` });
        setSendingIndividual(false);
        return;
      }

      setSubmitted(true);
      setCep('');
      setStreet('');
      setNumber('');
      setComplement('');
      setReference('');
      setPhone('');
      setCity('');
      setNeighborhood('');
      setCity('');
      setOrder(response.content);
      setType('');
      setRecipient('');
    } catch (error) {
      apply('error', { hasError: true, message: `Erro ${error}` });
    }
    setSendingIndividual(false);
  };

  function onChangePhone(e: ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    if (value.length > 14) {
      return;
    }
    setPhone(value);

    if (value.length > 0 && value.length < 10 && value.indexOf('(') >= 0) { setPhone(value.replaceAll('(', '').replaceAll(') ', '')); } else
    if (value.length === 10 && value.indexOf('(') < 0) {
      const ddd = value.substring(0, 2);
      const cellNumber = value.substring(2, value.length);
      setPhone(`(${ddd}) ${cellNumber}`);
    }
  }

  function onChangeValue(e: ChangeEvent<HTMLInputElement>) {
    if (isNumber(e.target.value)) {
      setValueDeclared(Number(e.target.value));
      setPrice(calculePrice(Number(e.target.value), type, city).toString());
    }
  }

  function onChangeType(e: ChangeEvent<HTMLSelectElement>) {
    setType(e.target.value);
    setPrice(calculePrice(valueDeclared, e.target.value, city).toString());
  }

  return (
    <Layout>
      <section className={style.section}>
        <LoginForm />
        {isLogged && (
          <div className={style.forms}>
            { client.allowInlote
            && (
            <div className={style.chooseForm}>
              <h1 className={`${style.titleChoose} ${!inLote ? style.titleSelected : ''}`}>Individual</h1>
              <ToggleButton handle={() => setInLote(!inLote)} />
              <h1 className={`${style.titleChoose} ${inLote ? style.titleSelected : ''}`}>Em lote</h1>
            </div>
            )}
            {!inLote && (
              order === '' ? (
                <form className={style.individualForm}>
                  <InputForm
                    label="CEP *"
                    type="text"
                    name="cep"
                    id="cep"
                    placeholder="60123456"
                    isRequired
                    alertRequired={requiredError && cep === ''}
                    onChange={getInfosByCep}
                    value={cep}
                      // onKeyDown={handleKeypress}
                    classPlus={style.i1}
                  />
                  <InputForm
                    label="Rua"
                    type="text"
                    name="street"
                    id="street"
                    placeholder=""
                    isRequired
                    alertRequired={requiredError && street === ''}
                    setOnChange={setStreet}
                    value={street}
                    onKeyDown={handleKeypress}
                    disable
                    classPlus={style.i2}
                  />
                  <InputForm
                    label="Bairro"
                    type="text"
                    name="neighborhood"
                    id="neighborhood"
                    placeholder=""
                    isRequired
                    alertRequired={requiredError && neighborhood === ''}
                    setOnChange={setNeighborhood}
                    value={neighborhood}
                    onKeyDown={handleKeypress}
                    disable
                    classPlus={style.i3}
                  />
                  <InputForm
                    label="Estado"
                    type="text"
                    name="state"
                    id="state"
                    placeholder=""
                    isRequired
                    alertRequired={requiredError && state === ''}
                    setOnChange={setState}
                    value={state}
                    onKeyDown={handleKeypress}
                    disable
                    classPlus={style.i4}
                  />
                  <InputForm
                    label="Cidade"
                    type="text"
                    name="city"
                    id="city"
                    placeholder=""
                    isRequired
                    alertRequired={requiredError && city === ''}
                    setOnChange={setCity}
                    value={city}
                    onKeyDown={handleKeypress}
                    disable
                    classPlus={style.i5_1}
                  />
                  <InputForm
                    label="Núm *"
                    type="text"
                    name="number"
                    id="number"
                    placeholder="123"
                    isRequired
                    alertRequired={requiredError && number === ''}
                    setOnChange={setNumber}
                    value={number}
                    onKeyDown={handleKeypress}
                    classPlus={style.i5}
                  />
                  <InputForm
                    label="Telefone *"
                    type="text"
                    name="phone"
                    id="phone"
                    placeholder="(85) 989888888"
                    isRequired
                    alertRequired={requiredError && phone === ''}
                    onChange={onChangePhone}
                    value={phone}
                    onKeyDown={handleKeypress}
                    classPlus={style.i6}
                  />
                  <InputForm
                    label="Complemento"
                    type="text"
                    name="complement"
                    id="complement"
                    placeholder="Casa | Apartamento | ap 14"
                    isRequired={false}
                    setOnChange={setComplement}
                    value={complement}
                    onKeyDown={handleKeypress}
                    classPlus={style.i7}
                  />
                  <InputForm
                    label="Ponto de referência"
                    type="text"
                    name="reference"
                    id="reference"
                    placeholder="Próximo a igreja"
                    isRequired={false}
                    setOnChange={setReference}
                    value={reference}
                    onKeyDown={handleKeypress}
                    classPlus={style.i8}
                  />
                  <InputForm
                    label="Destinatário *"
                    type="text"
                    name="recipient"
                    id="recipient"
                    placeholder="José da Silva"
                    isRequired
                    setOnChange={setRecipient}
                    value={recipient}
                    onKeyDown={handleKeypress}
                    classPlus={style.i8}
                    alertRequired={requiredError && recipient === ''}
                  />
                  <InputForm
                    label="Modalidade *"
                    type="text"
                    name="deliveryType"
                    id="deliveryType"
                    placeholder="Selecione"
                    isRequired
                    selectOnChange={onChangeType}
                    value={type}
                    isSelect
                    optionsSelect={optionsSelect}
                    classPlus={style.i9}
                    alertRequired={requiredError && type === ''}
                  />
                  <InputForm
                    label="Valor da mercadoria"
                    littleLabel="É o valor que será devolvido caso o pacote seja 'perdido'"
                    type="text"
                    name="value"
                    id="value"
                    placeholder="150"
                    onChange={onChangeValue}
                    value={`${valueDeclared}`}
                    onKeyDown={handleKeypress}
                    classPlus={style.ilast_half}

                  />
                  <InputForm
                    label="Preço"
                    type="text"
                    name="preco"
                    id="preco"
                    placeholder="R$ --"
                    isRequired
                    setOnChange={setPrice}
                    value={`R$ ${price}`}
                    onKeyDown={handleKeypress}
                    disable
                    classPlus={style.ilast_half}

                  />
                  <Button
                    handleSubmit={individualHandleSubmit}
                    sending={sendingIndividual}
                    text="Enviar"
                    id="endButton"
                    type="submit"
                    plusClass={style.i10}
                  />
                </form>
              )
                : (
                  <div className={style.resultIndividualForm}>
                    <div>
                      Este é o número do seu pedido:
                      {' '}
                      <strong>{order}</strong>
                    </div>
                    <span>anote na sua encomenda e o resto é com a gente.</span>
                    <Button
                      plusClass={style.resultButton}
                      handleSubmit={() => setOrder('')}
                      sending={downloading}
                      text="Inserir outro"
                      type="button"
                    />
                  </div>
                )

            )}
            {inLote && (
              <form className={style.inLoteForm}>
                <div className={style.inputUp}>
                  <label htmlFor="table" className={style.choose_btn}>
                    {fileName !== '' ? `Arquivo selecionado: ${fileName}` : 'Escolher arquivo'}
                  </label>
                  <input
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    id="table"
                    name="table"
                    type="file"
                    multiple={false}
                    onChange={handleFileChange}
                    onKeyDown={handleKeypress}
                  />
                  {fileSelected && <button type="button" onClick={onCancelFile}>Cancelar</button>}
                  <Button
                    plusClass={style.modelButton}
                    handleSubmit={downloadModel}
                    sending={downloading}
                    text="Baixar tabela modelo"
                    type="button"
                  />
                </div>
                <Button handleSubmit={handleSubmit} sending={sending} text="Enviar" id="endButton" type="submit" />
              </form>
            )}
          </div>
        )}
        {submitted && !hasError && <span className={style.successMessage}>Sucesso ao enviar.</span>}
      </section>
    </Layout>
  );
}
