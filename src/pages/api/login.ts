import { loginService } from '@/lib/user/login/ILogin';
import type { NextApiRequest, NextApiResponse } from 'next';

export type ResponseLoginApi = {
  status: number;
  error: string | null;
  content?: any;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<ResponseLoginApi | null>) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({
      status: 405,
      error: 'Method Not Allowed',
    });
    return;
  }

  const prefixCompany = req.headers['x-username'];
  const passCompany = req.headers['x-authentication'];

  if (!prefixCompany || !passCompany) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

  const {
    token, isAdmin, id, userName,
  } = await loginService.login(prefixCompany.toString(), passCompany.toString());

  if (!token) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

  try {
    res.status(200).json({
      status: 200,
      error: null,
      content: {
        token, isAdmin, id, userName,
      },
    });
  } catch (e) {
    res.status(500).json({ status: 500, error: 'Erro interno' });
  }
};

export default handler;
