import { AccountInfo } from '@/lib/types/AccountInfo';
import { useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import {
  Collapse,
} from 'reactstrap';
import { useApply, useReducers } from '@/lib/redux/hooks';
import { DataCreateClient } from '@/pages/api/createClient';
import { CreateResponse } from '@/lib/account/IAccountInfosService';
import ClientForm from './clientForm';

type Props = {
  infos: AccountInfo[]
};

export default function ListClients({ infos }: Props) {
  const [edit, setEdit] = useState(false);
  const [create, setCreate] = useState(false);
  const [createSuccess, setCreateSuccess] = useState<CreateResponse | undefined>({ ok: false, user: '', pass: '' });
  const apply = useApply();
  const {
    isLogged, identification, token, userName,
  } = useReducers('user.isLogged', 'user.identification', 'user.token', 'user.userName');

  function handlerEdit() {
    setCreateSuccess({ ok: false, user: '', pass: '' });
    // eslint-disable-next-line no-console
    console.log('captura dados do cliente num formulário para edição');
    setEdit(true);
  }

  async function handlerCreate(info: AccountInfo): Promise<Boolean> {
    setCreateSuccess({ ok: false, user: '', pass: '' });
    apply('error', { hasError: false, message: '' });
    if (isLogged) {
      try {
        const res = await fetch('/api/createClient', {
          method: 'POST',
          headers: {
            'x-username': userName,
            'x-identification': window.sessionStorage.getItem('userid') || identification || '',
            'x-token': window.sessionStorage.getItem('token') || token || '',
          },
          body: JSON.stringify({
            ...info,
          }),
        });

        const { status, error, content }: DataCreateClient = await res.json();

        if (status !== 200) {
          apply('error', { hasError: true, message: `Erro ${error}` });
          setCreateSuccess(undefined);
          return false;
        }
        setCreateSuccess(content);
        return true;
      } catch (err) {
        apply('error', { hasError: true, message: 'Erro ' });
      }
    }
    setCreateSuccess(undefined);
    return false;
  }

  function backList() {
    // eslint-disable-next-line no-console
    console.log('captura dados do cliente num formulário para edição');
    setEdit(false);
    setCreate(false);
  }

  return (
    <>
      <Collapse isOpen={edit} className="m-3">
        <Button onClick={backList} className="ml-2">Cancelar/voltar</Button>
        <h2>Editar - em breve</h2>
      </Collapse>
      <Collapse isOpen={create} className="m-3">
        <Button onClick={backList} className="ml-2">Cancelar/voltar</Button>
        <h2>Cadastrar</h2>
        <ClientForm action={handlerCreate} />
        {createSuccess?.ok && (
        <Alert color="info">
          {`Sucesso ao criar cliente usuário: ${createSuccess.user} e senha: ${createSuccess.pass},
         o usuário e senha podem ser alterados após fazer o login pelo painel`}
        </Alert>
        )}
      </Collapse>
      <Collapse isOpen={!edit && !create}>
        <div className="d-flex flex-row">
          <h2>Clientes</h2>
          <Button onClick={() => setCreate(true)} className="ml-2">Cadastrar</Button>
        </div>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Prefixo</th>
              <th>Nome</th>
              <th>Nome fantasia</th>
              <th>Editar</th>
            </tr>
          </thead>
          <tbody>
            {infos.map((info) => (
              <tr key={info.client.prefix}>
                <td>{info.client.prefix}</td>
                <td>{info.client.corporateName}</td>
                <td>{info.client.name}</td>
                <td>
                  <Button onClick={handlerEdit}>Editar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Collapse>
    </>
  );
}
