import { deliveryService } from '@/lib/task/IDeliveryService';
import { randomInt } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { loginService } from '@/lib/user/login/ILogin';
import { accountService } from '@/lib/account/IAccountInfosService';
import { mountSendTask } from '@/lib/task/helper';
import { MailService } from '@/lib/mail/IMailService';

export type ResponseSendTaskApi = {
  status: number;
  error: string | null;
  content?: string;
};

async function sendEmail(username:string, data:string) {
  return MailService.sendEmail(
    '"Tabelas (bid.log.br)" <sender@bid.log.br>',
    'tabelas@bid.log.br',
    `${username} - Tabela pelo formulário do site`,
    data,
  );
}

const handler = async (req: NextApiRequest, res: NextApiResponse<ResponseSendTaskApi | null>) => {
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

  const { token, id } = await loginService.authenticate(username.toString(), tokenSession.toString());

  if (!token || !id) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

  const accountInfos = await accountService.getAccountInfosByUserID(id.toString());

  if (!accountInfos) {
    res.status(500).json({ status: 500, error: `sem configuração encontrada, user ${id}` });
    return;
  }

  const {
    street, number, neighborhood, city, state, cep, complement, reference, phone, recipient, type, declaredValue, orderNumber,
  } = JSON.parse(req.body);

  try {
    await sendEmail(username.toString(), JSON.parse(req.body));
  } catch (error) {
    res.status(500).json({ status: 500, error: `erro ao enviar email ${error}` });
  }

  const { client } = accountInfos;

  try {
    const order = !orderNumber || orderNumber === '' ? `${client.prefix}-${randomInt(100000)}` : orderNumber;
    const data = mountSendTask(
      street,
      number,
      neighborhood,
      city,
      state,
      cep,
      complement,
      reference,
      order,
      recipient,
      declaredValue,
      accountInfos,
      phone,
      type,
    );
    const response = await deliveryService.sendTask(data);
    if (response?.error || !response?.content) {
      res.status(500).json({ status: 500, error: JSON.stringify(response.error) });
      return;
    }
    res.status(200).json({ status: 200, error: null, content: order });
  } catch (e) {
    res.status(500).json({ status: 500, error: `${e}` });
  }
};

export default handler;
