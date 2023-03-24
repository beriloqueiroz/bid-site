/* eslint-disable react/require-default-props */
import Button from '@/components/button';
import InputForm from '@/components/inputForm';
import { useApply, useReducers } from '@/lib/redux/hooks';

import { DataGetAccounts } from '@/pages/api/getAccountsOptionsInfos';
import { ResponseLoginApi } from '@/pages/api/login';
import React, { useEffect, useState } from 'react';
import {
  initialAccountsToSend, initialClient, initialError, initialUser,
} from '@/lib/redux/state/initial';
import { DataGetAccount } from '@/pages/api/getAccountInfos';
import style from './style.module.scss';

interface Props {
  isPrivate?:boolean;
}

export default function LoginForm({ isPrivate }:Props) {
  const apply = useApply();
  const [sendingLogin, setSendingLogin] = useState(false);
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [requiredError, setRequiredError] = useState(false);

  const {
    isLogged, identification, token, userName,
  } = useReducers('user.isLogged', 'user.identification', 'user.token', 'user.userName');

  function cleanLogin():void {
    window.sessionStorage.removeItem('token');
    window.sessionStorage.removeItem('userid');
    window.sessionStorage.removeItem('username');

    apply('user', initialUser);
    apply('accountsToSend', initialAccountsToSend);
    apply('client', initialClient);
    apply('error', initialError);
  }

  function clearLogin() {
    setUser('');
    setPassword('');
    cleanLogin();
  }

  async function getOptionsAccounts() {
    const res = await fetch('/api/getAccountsOptionsInfos', {
      method: 'GET',
      headers: {
        'x-username': window.sessionStorage.getItem('username') || userName || '',
        'x-token': window.sessionStorage.getItem('token') || token || '',
      },
    });

    const { status, error, content }: DataGetAccounts = await res.json();

    if (status === 401 || !content) {
      apply('error', { hasError: true, message: 'Autenticação inválida' });
      clearLogin();
      throw new Error(`${error}`);
    }

    apply('accountsToSend', {
      content: content.map((elem) => ({
        name: elem.name,
        id: elem.id,
      })),
    });
  }

  async function getAccountInfos() {
    const res = await fetch('/api/getAccountInfos', {
      method: 'GET',
      headers: {
        'x-username': window.sessionStorage.getItem('username') || userName || '',
        'x-token': window.sessionStorage.getItem('token') || token || '',
      },
    });

    const { status, error, content }: DataGetAccount = await res.json();

    if (status === 401 || !content) {
      apply('error', { hasError: true, message: 'Autenticação inválida' });
      clearLogin();
      throw new Error(`${error}`);
    }

    apply('client', content);
  }

  useEffect(() => {
    const tokenSession = window.sessionStorage.getItem('token');
    const useridSession = window.sessionStorage.getItem('userid');
    const usernameSession = window.sessionStorage.getItem('username');
    async function authenticate() {
      const res = await fetch('/api/authenticate', {
        method: 'GET',
        headers: {
          'x-username': userName || usernameSession || '',
          'x-token': token || tokenSession || '',
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
        apply('error', { hasError: true, message: 'Autenticação inválida' });
        clearLogin();
        throw new Error(`${error}`);
      }
      apply('user', {
        isLogged: true, userName: usernameSession, identification: useridSession, token: tokenSession,
      });
      if (isPrivate) { await getOptionsAccounts(); }
      await getAccountInfos();
    }
    if (tokenSession && useridSession && usernameSession && !isLogged) {
      authenticate();
    }
  }, []);

  const login = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();
    setRequiredError(false);

    try {
      setSendingLogin(true);
      if (user === '' || password === '') {
        clearLogin();
        setRequiredError(true);
        apply('error', { hasError: true, message: 'Credenciais não informadas' });
        return;
      }

      apply('error', { hasError: false, message: '' });

      const res = await fetch('/api/login', {
        method: 'GET',
        headers: {
          'x-username': user,
          'x-authentication': password,
        },
      });

      const { status, error, content }: ResponseLoginApi = await res.json();

      if (status !== 200 || !content || !content.token || !content.id || !content.userName) {
        apply('error', { hasError: true, message: `Erro de autenticação ${error}` });
        clearLogin();
        return;
      }

      if (!content.isAdmin && isPrivate) {
        apply('error', { hasError: true, message: 'Erro de autenticação' });
        clearLogin();
        return;
      }

      apply('user', {
        isLogged: true, userName: user, identification: content.id, token: content.token,
      });

      window.sessionStorage.setItem('token', content.token);
      window.sessionStorage.setItem('userid', content.id.toString());
      window.sessionStorage.setItem('username', content.userName);
      if (isPrivate) { await getOptionsAccounts(); }
      await getAccountInfos();
    } catch (err) {
      apply('error', { hasError: true, message: 'Erro de autenticação' });
      clearLogin();
    }
    setSendingLogin(false);
  };

  const logout = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();

    try {
      const res = await fetch('/api/logout', {
        method: 'GET',
        headers: {
          'x-username': user,
          'x-identification': window.sessionStorage.getItem('userid') || identification || '',
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

      clearLogin();

      if (status !== 200) {
        apply('error', { hasError: true, message: `Erro de autenticação ${error}` });
        return;
      }
      apply('error', { hasError: false, message: '' });
    } catch (err) {
      apply('error', { hasError: true, message: 'Erro de autenticação' });
    }
  };

  return (
    <form className={style.loginForm}>
      {!isLogged && (
      <>
        <InputForm
          label="Usuário"
          type="text"
          name="username"
          id="username"
          placeholder="USERNAME"
          isRequired
          alertRequired={requiredError && user === ''}
          setOnChange={setUser}
          value={user}
          disable={isLogged}
        />
        <InputForm
          label="Senha"
          type="password"
          name="password"
          id="password"
          placeholder="*********"
          isRequired
          alertRequired={requiredError && password === ''}
          setOnChange={setPassword}
          value={password}
          disable={isLogged}
        />
      </>
      )}
      {isLogged && (
      <h2>
        Usuário logado:
        {' '}
        {userName}
      </h2>
      )}
      <Button handleSubmit={!isLogged ? login : logout} sending={sendingLogin} text={!isLogged ? 'Entrar' : 'Sair'} id="login" type="submit" />
    </form>
  );
}
