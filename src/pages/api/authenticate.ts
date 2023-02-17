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

  if (!prefixCompany || !passCompany) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

  if (process.env[prefixCompany.toString()] != passCompany) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

  res.status(200).json({ status: 200, error: null, token: '123456' });
};

export default handler;
