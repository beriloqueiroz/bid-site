import { accountService } from '@/lib/account/IAccountService';
import type { NextApiRequest, NextApiResponse } from 'next';
import { TrackingTaskConfig } from '@/lib/types/TaskConfig';
import { loginService } from '@/lib/user/login/ILogin';

export type DataGetAccounts = {
  status: number;
  error: string | null;
  content?: TrackingTaskConfig[]
};

const handler = async (req: NextApiRequest, res: NextApiResponse<DataGetAccounts>) => {
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

  const { token, id, isAdmin } = await loginService.authenticate(prefixCompany.toString(), tokenSession.toString());

  if (!token || !id || !isAdmin) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

  const options = await accountService.getTrackingKeysByUserID('');

  if (!options.length) {
    res.status(404).json({ status: 401, error: 'Erro ao capturar opções de contas' });
    return;
  }

  res.status(200).json({
    status: 200, error: null, content: options.map((op) => ({ ...op, key: '' })),
  });
};

export default handler;
