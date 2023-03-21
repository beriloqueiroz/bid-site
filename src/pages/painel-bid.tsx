import {
  KeyboardEvent, useEffect, useState,
} from 'react';

import Button from '@/components/button';
import InputForm from '@/components/inputForm';
import Layout from '@/components/layout';
import { useRouter } from 'next/router';

import { OptionSelect } from '@/components/inputForm/props';
import { useApply, useReducers } from '@/lib/redux/hooks';
import LoginForm from '@/components/painel/login';
import style from '../styles/painel-bid.module.scss';
import { ResponseUploadApi } from './api/upload';

export default function CustomerPanel() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [errorGeral, setErrorGeral] = useState(false);
  const [messageError, setMessageError] = useState(' Desculpe, Erro ao enviar arquivo, tente novamente ou entre em contato.');
  const [fileName, setFileName] = useState('');
  const [fileSelected, setFileSelected] = useState<File | null>();
  const [requiredError, setRequiredError] = useState(false);

  const [resultLog, setResultLog] = useState<ResponseUploadApi[]>([]);
  const [accountEmail, setAccountEmail] = useState('');
  const [optionsSelect] = useState<OptionSelect[]>([
    { value: '', content: 'SELECIONE' },
    { content: 'Conta 1', value: 'bid_entregas1' },
    { content: 'Conta 2', value: 'bid_entregas2' },
    { content: 'Conta 3', value: 'bid_entregas3' },
    { content: 'Conta 4', value: 'bid_entregas4' },
    { content: 'Master', value: 'bid_entregas' },
  ]);

  const apply = useApply();

  function clearLogin() {
    window.sessionStorage.removeItem('token');
    window.sessionStorage.removeItem('userid');
    window.sessionStorage.removeItem('username');
    apply('user', { isLogged: false, userName: '', identification: '' });
  }

  const { isLogged, userName, token } = useReducers('user.isLogged', 'user.userName', 'user.token');

  useEffect(() => {
    const tokenSession = window.sessionStorage.getItem('token');
    const useridSession = window.sessionStorage.getItem('userid');
    const usernameSession = window.sessionStorage.getItem('username');
    async function authenticate() {
      const res = await fetch('/api/authenticate', {
        method: 'GET',
        headers: {
          'X-Company': window.sessionStorage.getItem('username') || userName || '',
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
        setErrorGeral(true);
        clearLogin();
        throw new Error(`${error}`);
      }
      apply('user', {
        isLogged: true, userName: usernameSession, identification: useridSession, token: tokenSession,
      });
    }
    if (tokenSession && useridSession && usernameSession) {
      authenticate();
    }
  }, []);

  const router = useRouter();

  const handleMessageError = (msg: string) => {
    setMessageError(msg);
    router.push('#error');
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
      setErrorGeral(true);
      handleMessageError('Erro ao selecionar arquivo!');
      return;
    }
    setFileSelected(fileList[0]);
    setFileName(fileList[0].name);
  };

  const handleSubmit = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();

    if (!fileSelected) {
      setErrorGeral(true);
      throw new Error('Arquivo não selecionado!');
    }

    if (userName === '' || token === '' || !isLogged) {
      clearLogin();
      setErrorGeral(true);
      throw new Error('Credenciais não informadas');
    }

    if (accountEmail === '') {
      setErrorGeral(true);
      setRequiredError(true);
      throw new Error('preencha todos os campos obrigatórios, os campos obrigatórios possuem *');
    }

    setSending(true);
    setErrorGeral(false);
    setResultLog([]);

    try {
      const formData = new FormData();
      formData.append('media', fileSelected);

      const res = await fetch('/api/uploadDirect', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Company': window.sessionStorage.getItem('username') || userName || '',
          'x-account': accountEmail,
          'x-token': window.sessionStorage.getItem('token') || token || '',
        },
      });

      const response = await res.json();

      if (!response?.length) {
        if (response?.status === 401) {
          setErrorGeral(true);
          clearLogin();
          setSending(false);
          throw new Error(`${errorGeral}`);
        }

        if (response?.error) {
          setErrorGeral(true);
          setSending(false);
          throw new Error(`${errorGeral}entre em contato conosco!`);
        }

        if (response?.error && response?.status === 500) {
          setErrorGeral(true);
          setSending(false);
          throw new Error('entre em contato!');
        }
      } else {
        setResultLog(response as ResponseUploadApi[]);
      }
      setSubmitted(true);
    } catch (error) {
      setErrorGeral(true);
      handleMessageError(`Erro, ${error}`);
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
          'X-Company': window.sessionStorage.getItem('username') || userName || '',
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
        setErrorGeral(true);
        clearLogin();
        throw new Error(`${error}`);
      }

      if (status !== 200) {
        setErrorGeral(true);
        setDownloading(false);
        throw new Error('entre em contato conosco!');
      }
      router.push('/model_admin.csv');
      setDownloading(false);
    } catch (err) {
      setErrorGeral(true);
      handleMessageError(`Erro ao baixar modelo ${errorGeral}`);
    }
  }

  const handleKeypress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <Layout>
      <section className={style.section}>
        <LoginForm />
        {isLogged && (
          <div className={style.forms}>
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
              <InputForm
                label="Conta *"
                type="text"
                name="accountEmail"
                id="accountEmail"
                placeholder="Selecione"
                isRequired
                setOnChange={setAccountEmail}
                value={accountEmail}
                isSelect
                optionsSelect={optionsSelect}
                alertRequired={requiredError && accountEmail === ''}
              />
              <Button handleSubmit={handleSubmit} sending={sending} text="Enviar" id="endButton" type="submit" />
            </form>

          </div>
        )}
        {errorGeral && (
          <span id="error" className={style.errorMessage}>
            {messageError}
          </span>
        )}
        {submitted && !errorGeral && <span className={style.successMessage}>Tasks enviadas, verifique o resultado detalhado.</span>}
        {submitted && !errorGeral && <span className={style.successMessage}>Resultado detalhado:</span>}
        <div className={style.resultLog}>
          {resultLog.length > 0 && (
            resultLog.map((resLg) => (
              <div className={`${style.resultLogItem} ${!resLg?.error ? style.successLog : ''}`} key={resLg.content}>
                <div>
                  número do pedido:
                  {resLg.content}
                </div>
                {resLg?.error && (
                <div>
                  erro:
                  {resLg.error}
                </div>
                ) }
              </div>
            ))
          )}
        </div>

      </section>
    </Layout>
  );
}
