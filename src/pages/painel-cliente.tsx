import { ChangeEvent, KeyboardEvent, useState } from 'react';

import Button from '@/components/button';
import InputForm from '@/components/inputForm';
import { OptionSelect } from '@/components/inputForm/props';
import Layout from '@/components/layout';
import ToggleButton from '@/components/toggleButton';
import { useRouter } from 'next/router';

import style from '../styles/painel-cliente.module.scss';
import { ResponseCepApi } from './api/getInfosByCep';
import { ResponseLoginApi } from './api/login';
import { ResponseSendTaskApi } from './api/sendTask';
import { ResponseUploadApi } from './api/upload';

export default function CustomerPanel() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingLogin, setSendingLogin] = useState(false);
  const [sendingIndividual, setSendingIndividual] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(false);
  const [messageError, setMessageError] = useState(' Desculpe, Erro ao enviar arquivo, tente novamente ou entre em contato.');
  const [fileName, setFileName] = useState('');
  const [prefix, setPrefix] = useState('');
  const [password, setPassword] = useState('');
  const [fileSelected, setFileSelected] = useState<File | null>();

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
  const [deliveryType, setDeliveryType] = useState('');

  const [requiredError, setRequiredError] = useState(false);
  const [isLogged, setLogged] = useState(false);
  const [inLote, setInLote] = useState(false);
  const [optionsSelect, setOptionsSelect] = useState<OptionSelect[]>([
    { value: '', content: 'SELECIONE' },
    { value: 'D+1', content: 'ENTREGA NO PRÓXIMO DIA ÚTIL' },
    { value: 'D', content: 'ENTREGA NO MESMO DIA' },
  ]);

  const router = useRouter();

  const handleMessageError = (msg: string) => {
    setMessageError(msg);
    router.push('#error');
  };

  const login = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();

    try {
      setSendingLogin(true);
      if (prefix == '' || password == '') {
        setError(true);
        throw new Error('Credenciais não informadas');
      }

      setError(false);

      const res = await fetch('/api/login', {
        method: 'GET',
        headers: {
          'X-Company': prefix,
          'X-Authentication': password,
        },
      });

      const { status, error }: ResponseLoginApi = await res.json();

      if (status !== 200) {
        setError(true);
        throw new Error(error + ', entre em contato conosco!');
      }

      setLogged(true);
    } catch (error) {
      setError(true);
      handleMessageError('Erro, ao fazer login, entre em contato! ' + error);
    }
    setSendingLogin(false);
  };

  const logout = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();
    try {
      setLogged(false);
      setPrefix('');
      setPassword('');
      setError(false);
      setSubmitted(false);
      setCep('');
      setStreet('');
      setNumber('');
      setComplement('');
      setReference('');
      setPhone('');
      setCity('');
      setNeighborhood('');
      setCity('');
      setOrder('');
      setDeliveryType('');
      setRecipient('');
    } catch (error) {
      setError(true);
      handleMessageError('Erro, fazer login ' + error);
    }
  };

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

    if (!fileList || !fileList[0]) {
      setError(true);
      handleMessageError('Erro ao selecionar arquivo!');
      return;
    }
    setFileSelected(fileList[0]);
    setFileName(fileList[0].name);
  };

  function isNumber(value: string) {
    if (typeof value === 'string') {
      return !isNaN(parseInt(value));
    }
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
        const res = await fetch('/api/getInfosByCep' + '?cep=' + e.target.value, {
          method: 'GET',
          headers: {
            'X-Company': prefix,
            'X-Authentication': password,
          },
        });

        const { status, error, content }: ResponseCepApi = await res.json();

        if (!content) {
          setError(true);
          throw new Error(error + ', entre em contato conosco!');
        }

        setStreet(content.rua);
        setNeighborhood(content.bairro);
        setCity(content.cidade);
        setState(content.estado);
      } catch (error) {
        setError(true);
        handleMessageError('Erro, ao buscar informações, ' + error);
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
      if (prefix == '' || password == '') {
        setError(true);
        throw new Error('Credenciais não informadas');
      }

      if (street == '' || number == '' || neighborhood == '' || city == '' || state == '' || cep == '' || deliveryType == '') {
        setError(true);
        setRequiredError(true);
        throw new Error(`preencha todos os campos obrigatórios, os campos obrigatórios possuem *`);
      }

      setSendingIndividual(true);
      setError(false);

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
        deliveryType,
      };
      const res = await fetch('/api/sendTask', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'X-Company': prefix,
          'X-Authentication': password,
        },
      });

      const response: ResponseSendTaskApi = await res.json();

      if (!response.content) {
        setError(true);
        setSendingIndividual(false);
        throw new Error('Erro ao enviar pacote ' + response?.error);
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
      setDeliveryType('');
      setRecipient('');
    } catch (error) {
      console.log('🚀 ~ file: painel-cliente.tsx:249 ~ individualHandleSubmit ~ error', error);
      setError(true);
      handleMessageError('Erro, ao enviar informações, ' + error);
    }
    setSendingIndividual(false);
  };

  const handleSubmit = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();

    if (!fileSelected) {
      setError(true);
      throw new Error('Arquivo não selecionado!');
    }

    if (prefix == '' || password == '') {
      setError(true);
      throw new Error('Credenciais não informadas');
    }

    setSending(true);
    setError(false);

    try {
      const formData = new FormData();
      formData.append('media', fileSelected);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Company': prefix,
          'X-Authentication': password,
        },
      });

      const { status, error }: ResponseUploadApi = await res.json();

      if (error && status == 401) {
        setError(true);
        setSending(false);
        throw new Error(error + 'entre em contato conosco!');
      }

      if (error && status == 500) {
        setError(true);
        setSending(false);
        throw new Error('entre em contato!');
      }

      setSubmitted(true);
    } catch (error) {
      setError(true);
      handleMessageError('Erro, ' + error);
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
          'X-Company': prefix,
          'X-Authentication': password,
        },
      });

      const {
        status,
        error,
      }: {
        status: number;
        error: string | null;
      } = await res.json();

      if (status != 200) {
        setError(true);
        setDownloading(false);
        throw new Error('entre em contato conosco!');
      }
      router.push(`/model.xlsx`);
      setDownloading(false);
    } catch (e) {
      setError(true);
      handleMessageError('Erro ao baixar modelo ' + error);
    }
  }

  const handleKeypress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <Layout simpleHeader={true}>
      <section className={style.section}>
        <form className={style.loginForm}>
          <InputForm
            label="Prefixo"
            type="text"
            name="prefix"
            id="prefix"
            placeholder="PREFX"
            isRequired={true}
            alertRequired={requiredError && prefix == ''}
            setOnChange={setPrefix}
            value={prefix}
            disable={isLogged}
          />
          <InputForm
            label="Senha"
            type="password"
            name="password"
            id="password"
            placeholder="*********"
            isRequired={true}
            alertRequired={requiredError && password == ''}
            setOnChange={setPassword}
            value={password}
            disable={isLogged}
          />
          <Button handleSubmit={!isLogged ? login : logout} sending={sendingLogin} text={!isLogged ? 'Entrar' : 'Sair'} id="login" type="submit" />
        </form>
        {isLogged && (
          <div className={style.forms}>
            <div className={style.chooseForm}>
              <h1 className={`${style.titleChoose} ${!inLote ? style.titleSelected : ''}`}>Individual</h1>
              <ToggleButton handle={() => setInLote(!inLote)} />
              <h1 className={`${style.titleChoose} ${inLote ? style.titleSelected : ''}`}>Em lote</h1>
            </div>
            {!inLote ? (
              <>
                {order == '' ? (
                  <form className={style.individualForm}>
                    <InputForm
                      label="CEP *"
                      type="text"
                      name="cep"
                      id="cep"
                      placeholder="60123456"
                      isRequired={true}
                      alertRequired={requiredError && cep == ''}
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
                      isRequired={true}
                      alertRequired={requiredError && street == ''}
                      setOnChange={setStreet}
                      value={street}
                      onKeyDown={handleKeypress}
                      disable={true}
                      classPlus={style.i2}
                    />
                    <InputForm
                      label="Bairro"
                      type="text"
                      name="neighborhood"
                      id="neighborhood"
                      placeholder=""
                      isRequired={true}
                      alertRequired={requiredError && neighborhood == ''}
                      setOnChange={setNeighborhood}
                      value={neighborhood}
                      onKeyDown={handleKeypress}
                      disable={true}
                      classPlus={style.i3}
                    />
                    <InputForm
                      label="Estado"
                      type="text"
                      name="state"
                      id="state"
                      placeholder=""
                      isRequired={true}
                      alertRequired={requiredError && state == ''}
                      setOnChange={setState}
                      value={state}
                      onKeyDown={handleKeypress}
                      disable={true}
                      classPlus={style.i4}
                    />
                    <InputForm
                      label="Número *"
                      type="text"
                      name="number"
                      id="number"
                      placeholder="123"
                      isRequired={true}
                      alertRequired={requiredError && number == ''}
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
                      placeholder="85 989888888"
                      isRequired={true}
                      alertRequired={requiredError && phone == ''}
                      setOnChange={setPhone}
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
                      placeholder="próximo ao bar do seu zé"
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
                      placeholder="josé da silva"
                      isRequired={true}
                      setOnChange={setRecipient}
                      value={recipient}
                      onKeyDown={handleKeypress}
                      classPlus={style.i8}
                      alertRequired={requiredError && recipient == ''}
                    />
                    <InputForm
                      label="Modalidade *"
                      type="text"
                      name="deliveryType"
                      id="deliveryType"
                      placeholder="Selecione"
                      isRequired={true}
                      setOnChange={setDeliveryType}
                      value={deliveryType}
                      isSelect={true}
                      optionsSelect={optionsSelect}
                      classPlus={style.i9}
                      alertRequired={requiredError && deliveryType == ''}
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
                ) : (
                  <div className={style.resultIndividualForm}>
                    <div>
                      Este é o número do seu pedido: <strong>{order}</strong>
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
                )}
              </>
            ) : (
              <form className={style.inLoteForm}>
                <div className={style.inputUp}>
                  <label htmlFor="table" className={style.choose_btn}>
                    {fileName != '' ? `Arquivo selecionado: ${fileName}` : 'Escolher arquivo'}
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
                  {fileSelected && <button onClick={onCancelFile}>Cancelar</button>}
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
        {error && (
          <span id="error" className={style.errorMessage}>
            {messageError}
          </span>
        )}
        {submitted && !error && <span className={style.successMessage}>Sucesso ao enviar.</span>}
      </section>
    </Layout>
  );
}
