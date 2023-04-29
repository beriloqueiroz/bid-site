import { authResponse } from '@/lib/types/AuthResponse';
import { loginService } from '@/lib/user/login/ILogin';
import type { NextApiRequest, NextApiResponse } from 'next';

export type ResponseLoginApi = {
  status: number;
  error: string | null;
  content?: authResponse;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<ResponseLoginApi | null>) => {
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

  const authResp = await loginService.authenticate(username.toString(), tokenSession.toString());

  if (!authResp.token || !authResp.id) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

  const {
    newUsername,
    oldPassword,
    newPassword,
  } = JSON.parse(req.body);

  const {
    token, isAdmin, id, userName,
  } = await loginService.edit(
    username.toString(),
    authResp.token,
    oldPassword,
    newUsername,
    newPassword,
  );

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
