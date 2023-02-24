import { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';

import Button from '@/components/button';
import InputForm from '@/components/inputForm';
import Layout from '@/components/layout';
import { useRouter } from 'next/router';

import style from '../styles/painel-bid.module.scss';
import { ResponseLoginApi } from './api/login';
import { ResponseUploadApi } from './api/upload';
import { OptionSelect } from '@/components/inputForm/props';

export default function CustomerPanel() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingLogin, setSendingLogin] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(false);
  const [messageError, setMessageError] = useState(' Desculpe, Erro ao enviar arquivo, tente novamente ou entre em contato.');
  const [fileName, setFileName] = useState('');
  const [prefix, setPrefix] = useState('');
  const [password, setPassword] = useState('');
  const [fileSelected, setFileSelected] = useState<File | null>();

  const [requiredError, setRequiredError] = useState(false);
  const [resultLog, setResultLog] = useState<ResponseUploadApi[]>([]);
  const [isLogged, setLogged] = useState(false);

  const [accountEmail, setAccountEmail] = useState('');
  const [optionsSelect, setOptionsSelect] = useState<OptionSelect[]>([
    { value: '', content: 'SELECIONE' },
    { content: 'Conta 1', value: 'bid_entregas1' },
    { content: 'Conta 2', value: 'bid_entregas2' },
    { content: 'Conta 3', value: 'bid_entregas3' },
    { content: 'Conta 4', value: 'bid_entregas4' },
    { content: 'Master', value: 'bid_entregas' },
  ]);

  useEffect(()=>{
    if (window.sessionStorage.getItem('token')){
      setLogged(true);
    }
  },[])

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

      const res = await fetch('/api/loginSuper', {
        method: 'GET',
        headers: {
          'X-Company': prefix,
          'X-Authentication': password,
        },
      });

      const { status, error, content }: ResponseLoginApi = await res.json();

      if (status === 401) {
        setError(true);
        setLogged(false);
        throw new Error(error + '');
      }

      if (status !== 200) {
        setError(true);
        throw new Error(error + ', entre em contato conosco!');
      }

      setLogged(true);
      window.sessionStorage.setItem('token', content);
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
      setResultLog([]);
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

    if (accountEmail == '') {
      setError(true);
      setRequiredError(true);
      throw new Error(`preencha todos os campos obrigatórios, os campos obrigatórios possuem *`);
    }

    setSending(true);
    setError(false);
    setResultLog([]);

    try {
      const formData = new FormData();
      formData.append('media', fileSelected);

      const res = await fetch('/api/uploadDirect', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Company': prefix,
          'X-Authentication': password,
          'x-account': accountEmail,
          'x-token': window.sessionStorage.getItem('token') || '',
        },
      });

      const response = await res.json();

      if (!response?.length) {
        if (response?.status === 401) {
          setError(true);
          setLogged(false);
          setSending(false);
          setPrefix('');
          setPassword('');
          throw new Error(error + '');
        }

        if (response?.error) {
          setError(true);
          setSending(false);
          throw new Error(error + 'entre em contato conosco!');
        }

        if (response?.error && response?.status == 500) {
          setError(true);
          setSending(false);
          throw new Error('entre em contato!');
        }      
      } else {
        setResultLog(response as ResponseUploadApi[]);
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
          'x-token': window.sessionStorage.getItem('token') || '',
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
        setError(true);
        setLogged(false);
        setPrefix('');
        setPassword('');
        throw new Error(error + '');
      }

      if (status != 200) {
        setError(true);
        setDownloading(false);
        throw new Error('entre em contato conosco!');
      }
      router.push(`/model_admin.csv`);
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
                <InputForm
                      label="Conta *"
                      type="text"
                      name="accountEmail"
                      id="accountEmail"
                      placeholder="Selecione"
                      isRequired={true}
                      setOnChange={setAccountEmail}
                      value={accountEmail}
                      isSelect={true}
                      optionsSelect={optionsSelect}
                      alertRequired={requiredError && accountEmail == ''}
                    />
                <Button handleSubmit={handleSubmit} sending={sending} text="Enviar" id="endButton" type="submit" />
              </form>
            
          </div>
        )}
        {error && (
          <span id="error" className={style.errorMessage}>
            {messageError}
          </span>
        )}
        {submitted && !error && <span className={style.successMessage}>Tasks enviadas, verifique o resultado detalhado.</span>}
        {submitted && !error && <span className={style.successMessage}>Resultado detalhado:</span>}
        <div className={style.resultLog}>
          {resultLog.length > 0 && (
            resultLog.map((resultLog, i)=><div className={`${style.resultLogItem} ${!resultLog?.error ? style.successLog : ''}`} key={i}>
              <div>número do pedido: {resultLog.content}</div>
              {resultLog?.error && <div>erro: {resultLog.error}</div>}
              <div>status: {resultLog.status}</div>
            </div>)
          )}
        </div>
        
      </section>
    </Layout>
  );
}
