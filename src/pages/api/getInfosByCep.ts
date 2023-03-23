import { loginService } from '@/lib/user/login/ILogin';
import { ceps } from '@/lib/helpers/ceps';
import type { NextApiRequest, NextApiResponse } from 'next';

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

const getInfosByCEP = async (cep: string) => {
  const infos = ceps.find((elem) => elem.cep === cep);
  return infos;
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
    const infos = await getInfosByCEP(`${param.cep}`);
    res.status(200).json({ status: 200, error: null, content: infos });
  } catch (e) {
    res.status(500).json({ status: 500, error: 'Erro interno' });
  }
};

export default handler;
