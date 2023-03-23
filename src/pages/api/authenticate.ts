import { loginService } from '@/lib/user/login/ILogin';
import type { NextApiRequest, NextApiResponse } from 'next';

export type DataAuthenticate = {
  status: number;
  error: string | null;
  token?: string;
  isAdmin?:boolean
};

const handler = async (req: NextApiRequest, res: NextApiResponse<DataAuthenticate | null>) => {
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

  const { token, isAdmin } = await loginService.authenticate(username.toString(), tokenSession.toString());

  if (!token) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }
  res.status(200).json({
    status: 200, error: null, token, isAdmin,
  });
};

export default handler;
