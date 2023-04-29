import { CreateResponse, accountService } from '@/lib/account/IAccountInfosService';
import type { NextApiRequest, NextApiResponse } from 'next';
import { loginService } from '@/lib/user/login/ILogin';
import { AccountInfo } from '@/lib/types/AccountInfo';

export type DataCreateClient = {
  status: number;
  error: string | null;
  content?: CreateResponse | undefined
};

const handler = async (req: NextApiRequest, res: NextApiResponse<DataCreateClient>) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({
      status: 405,
      error: 'Method Not Allowed',
    });
    return;
  }

  const username = req.headers['x-username'];
  const tokenSession = req.headers['x-token'];

  if (!username || !tokenSession) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

  const { token, id, isAdmin } = await loginService.authenticate(username.toString(), tokenSession.toString());

  if (!token || !id) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

  if (!isAdmin) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

  const client: AccountInfo = JSON.parse(req.body);

  const infos = await accountService.createAccountInfo(client);

  if (!infos) {
    res.status(404).json({ status: 404, error: 'Erro ao cadastrar, tente outro prefixo, ou entre em contato' });
    return;
  }

  res.status(200).json({
    status: 200, error: null, content: { ...infos },
  });
};

export default handler;
