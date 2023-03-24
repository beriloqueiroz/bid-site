import { accountService } from '@/lib/account/IAccountInfosService';
import type { NextApiRequest, NextApiResponse } from 'next';
import { loginService } from '@/lib/user/login/ILogin';
import { Client } from '@/lib/types/Client';

export type DataGetAccount = {
  status: number;
  error: string | null;
  content?: Client
};

const handler = async (req: NextApiRequest, res: NextApiResponse<DataGetAccount>) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
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

  const { token, id } = await loginService.authenticate(username.toString(), tokenSession.toString());

  if (!token || !id) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

  const infos = await accountService.getAccountInfosByUserID(id.toString());

  if (!infos) {
    res.status(404).json({ status: 404, error: 'Erro ao capturar conta' });
    return;
  }

  res.status(200).json({
    status: 200, error: null, content: infos.client,
  });
};

export default handler;
