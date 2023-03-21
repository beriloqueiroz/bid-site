import { loginService } from '@/lib/user/login/ILogin';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  status: number;
  error: string | null;
  token?: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data | null>) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({
      status: 405,
      error: 'Method Not Allowed',
    });
    return;
  }

  const prefixCompany = req.headers['x-username'];
  const tokenSession = req.headers['x-token'];

  if (!prefixCompany || !tokenSession) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

  const { token } = await loginService.authenticate(prefixCompany.toString(), tokenSession.toString());

  if (!token) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }
  res.status(200).json({ status: 200, error: null, token: '123456' });
};

export default handler;
