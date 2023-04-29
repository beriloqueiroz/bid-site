/* eslint-disable react/require-default-props */
import Button from '@/components/button';
import InputForm from '@/components/inputForm';
import { useApply, useReducers } from '@/lib/redux/hooks';

import React, { useState } from 'react';
import { ResponseLoginApi } from '@/pages/api/user';
import style from './style.module.scss';

interface Props {
  afterEdit?: ()=>void;
}

export default function EditUserForm({ afterEdit }:Props) {
  const {
    isLogged, identification, token, userName,
  } = useReducers('user.isLogged', 'user.identification', 'user.token', 'user.userName');
  const apply = useApply();
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(userName);
  const [password, setPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [requiredError, setRequiredError] = useState(false);

  const save = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();

    if (user === '' || password === '' || oldPassword === '') {
      setRequiredError(true);
      apply('error', { hasError: true, message: 'Alguns campos não informadas' });
      return;
    }

    setSaving(true);
    if (isLogged) {
      try {
        const res = await fetch('/api/user', {
          method: 'POST',
          headers: {
            'x-username': userName,
            'x-identification': window.sessionStorage.getItem('userid') || identification || '',
            'x-token': window.sessionStorage.getItem('token') || token || '',
          },
          body: JSON.stringify({
            newUsername: user,
            oldPassword,
            newPassword: password,
          }),
        });

        const { status, error, content }: ResponseLoginApi = await res.json();

        if (status !== 200) {
          apply('error', { hasError: true, message: `Erro de autenticação ${error}` });
          return;
        }
        apply('error', { hasError: false, message: '' });
        if (!content || !content.token || !content.id || !content.userName) {
          apply('error', { hasError: true, message: 'Erro de autenticação' });
          return;
        }
        apply('user', {
          isLogged: true, userName: user, identification: content.id, token: content.token,
        });

        window.sessionStorage.setItem('token', content.token);
        window.sessionStorage.setItem('userid', content.id.toString());
        window.sessionStorage.setItem('username', content.userName);
        if (afterEdit) { afterEdit(); }
      } catch (err) {
        apply('error', { hasError: true, message: 'Erro de autenticação' });
      }
    }
    setSaving(false);
  };

  return (
    <form className={style.loginForm}>
      {isLogged && (
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
        />
        <InputForm
          label="Senha antiga"
          type="password"
          name="password"
          id="password"
          placeholder="*********"
          isRequired
          alertRequired={requiredError && oldPassword === ''}
          setOnChange={setOldPassword}
          value={oldPassword}
        />
        <InputForm
          label="Senha nova"
          type="password"
          name="password"
          id="password"
          placeholder="*********"
          isRequired
          alertRequired={requiredError && password === ''}
          setOnChange={setPassword}
          value={password}
        />
      </>
      )}
      <Button handleSubmit={save} sending={saving} text="salvar/enviar" id="login" type="submit" />
    </form>
  );
}
