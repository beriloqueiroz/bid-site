import { loginImplementation } from '@/lib/login/implementations/enviroment';
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

  const prefixCompany = req.headers['x-company'];
  const passCompany = req.headers['x-authentication'];
  const tokenSession = req.headers['x-token'];

  if (!prefixCompany || !passCompany || !tokenSession) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

  const { token } = await loginImplementation.authenticate(prefixCompany.toString(), passCompany.toString(), tokenSession.toString());

  if (!token) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }
  res.status(200).json({ status: 200, error: null, token: '123456' });
};

export default handler;
