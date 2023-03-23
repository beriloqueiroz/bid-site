import { loginService } from '@/lib/user/login/ILogin';
import type { NextApiRequest, NextApiResponse } from 'next';

export type DataAuthenticate = {
  status: number;
  error: string | null;
  token?: string;
  isAdmin?:boolean,
  id?:number,
  userName?:string
};

const handler = async (req: NextApiRequest, res: NextApiResponse<DataAuthenticate | null>) => {
  const username = req.headers['x-username'];
  const tokenSession = req.headers['x-token'];

  if (!username || !tokenSession) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

  const {
    token, isAdmin, id, userName,
  } = await loginService.authenticate(username.toString(), tokenSession.toString());

  if (!token) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }
  res.status(200).json({
    status: 200, error: null, token, isAdmin, id, userName,
  });
};

export default handler;
