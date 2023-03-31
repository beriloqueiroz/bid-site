import { loginService } from '@/lib/user/login/ILogin';
import type { NextApiRequest, NextApiResponse } from 'next';
import { cepService } from '@/lib/cep/ICepsInfoService';

export type ResponseCepApi = {
  status: number;
  error: string | null;
  content?: {
    rua: string;
    bairro: string;
    cidade: string;
    cep: string;
    estado: string;
  };
};

const handler = async (req: NextApiRequest, res: NextApiResponse<ResponseCepApi | null>) => {
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

  try {
    const param = req.query;
    const infos = await cepService.getCepInfo(`${param.cep}`);
    res.status(200).json({ status: 200, error: null, content: infos });
  } catch (e) {
    res.status(500).json({ status: 500, error: 'Erro interno' });
  }
};

export default handler;
