import {
  KeyboardEvent, useEffect, useState,
} from 'react';

import Button from '@/components/button';
import InputForm from '@/components/inputForm';
import Layout from '@/components/layout';
import { useRouter } from 'next/router';

import { useApply, useReducers } from '@/lib/redux/hooks';
import LoginForm from '@/components/login';
import { TrackingTaskConfig } from '@/lib/types/AccountInfo';
import Error from '@/components/error';
import style from '../styles/painel-bid.module.scss';
import { ResponseUploadApi } from './api/upload';

export default function CustomerPanel() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSelected, setFileSelected] = useState<File | null>();
  const [requiredError, setRequiredError] = useState(false);

  const [resultLog, setResultLog] = useState<ResponseUploadApi[]>([]);
  const [account, setAccount] = useState('');

  const apply = useApply();

  function clearLogin() {
    window.sessionStorage.removeItem('token');
    window.sessionStorage.removeItem('userid');
    window.sessionStorage.removeItem('username');
    apply('user', { isLogged: false, userName: '', identification: '' });
  }

  const {
    isLogged, userName, token, content, hasError,
  } = useReducers('user.isLogged', 'user.userName', 'user.token', 'accountsToSend.content', 'error.hasError');

  useEffect(() => {
    if (!isLogged) {
      setSubmitted(false);
      setSending(false);
      setFileSelected(null);
      setFileName('');
    }
  }, [isLogged]);

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
    e.target.files = null;
  };

  const handleSubmit = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();
    apply('error', { hasError: false, message: '' });

    if (!fileSelected) {
      apply('error', { hasError: true, message: 'Arquivo não selecionado!' });
      return;
    }

    if (userName === '' || token === '' || !isLogged) {
      clearLogin();
      apply('error', { hasError: true, message: 'Credenciais não informadas' });
      return;
    }

    if (account === '') {
      apply('error', { hasError: true, message: 'preencha todos os campos obrigatórios, os campos obrigatórios possuem *' });
      setRequiredError(true);
    }

    setSending(true);
    apply('error', { hasError: false, message: '' });
    setResultLog([]);

    try {
      const formData = new FormData();
      formData.append('media', fileSelected);

      const res = await fetch('/api/uploadDirect', {
        method: 'POST',
        body: formData,
        headers: {
          'x-username': window.sessionStorage.getItem('username') || userName || '',
          'x-account': account,
          'x-token': window.sessionStorage.getItem('token') || token || '',
        },
      });

      const response = await res.json();

      if (!response?.length) {
        if (response?.status === 401) {
          apply('error', { hasError: true, message: 'Erro de autenticação' });
          clearLogin();
          setSending(false);
          return;
        }

        if (response?.error) {
          apply('error', { hasError: true, message: `Erro ${response?.error}` });
          setSending(false);
          return;
        }

        if (response?.error && response?.status === 500) {
          apply('error', { hasError: true, message: `Erro ${response?.error}` });
          setSending(false);
          return;
        }
      } else {
        setResultLog(response as ResponseUploadApi[]);
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
      router.push('/model_admin.csv');
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

  return (
    <Layout>
      <section className={style.section}>
        <LoginForm isPrivate />
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
                setOnChange={setAccount}
                value={account}
                isSelect
                optionsSelect={content.map((elem: TrackingTaskConfig) => ({ value: elem.id, content: elem.name }))}
                alertRequired={requiredError && account === ''}
              />
              <Button handleSubmit={handleSubmit} sending={sending} text="Enviar" id="endButton" type="submit" />
            </form>

          </div>
        )}
        {submitted && !hasError && <span className={style.successMessage}>Tasks enviadas, verifique o resultado detalhado.</span>}
        {submitted && !hasError && <span className={style.successMessage}>Resultado detalhado:</span>}
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
      <Error />
    </Layout>
  );
}
