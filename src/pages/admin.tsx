import Error from '@/components/error';
import Layout from '@/components/layout';
import ListClients from '@/components/listClients';
import LoginForm from '@/components/login';
import { useApply, useReducers } from '@/lib/redux/hooks';
import { useEffect, useState } from 'react';
import Loading from '@/components/loading';
import style from '../styles/admin.module.scss';

export default function Admin() {
  const [clients, setClients] = useState([]);

  const apply = useApply();
  function clearLogin() {
    window.sessionStorage.removeItem('token');
    window.sessionStorage.removeItem('userid');
    window.sessionStorage.removeItem('username');
    apply('user', { isLogged: false, userName: '', identification: '' });
  }

  const {
    isLogged, userName, token,
  } = useReducers('user.isLogged', 'user.userName', 'user.token', 'accountsToSend.content', 'error.hasError');

  useEffect(() => {
    const list = async () => {
      apply('error', { hasError: false, message: '' });

      if (userName === '' || token === '' || !isLogged) {
        clearLogin();
        apply('error', { hasError: true, message: 'Credenciais não informadas' });
        return;
      }

      apply('error', { hasError: false, message: '' });

      try {
        const res = await fetch('/api/listAccountInfos', {
          method: 'GET',
          headers: {
            'x-username': window.sessionStorage.getItem('username') || userName || '',
            'x-token': window.sessionStorage.getItem('token') || token || '',
          },
        });

        const response = await res.json();

        if (!response?.length) {
          if (response?.status === 401) {
            clearLogin();
            apply('error', { hasError: true, message: 'Erro de autenticação' });
            return;
          }

          if (response?.error) {
            apply('error', { hasError: true, message: `Erro ${response?.error}` });
            return;
          }

          if (response?.error && response?.status === 500) {
            apply('error', { hasError: true, message: `Erro ${response?.error}` });
            return;
          }
        }

        setClients(response.content);
      } catch (error) {
        apply('error', { hasError: true, message: `Erro ${error}` });
      }
    };
    if (isLogged) { list(); }
  }, [isLogged]);

  return (
    <Layout>
      <section className={style.section}>
        <LoginForm isPrivate />
        {isLogged && clients && (
        <ListClients infos={clients} />
        )}
        {isLogged && !clients?.length
        && <Loading />}
      </section>
      <Error />
    </Layout>
  );
}
