import { deliveryService } from '@/lib/task/IDeliveryService';
import { randomInt } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { loginService } from '@/lib/user/login/ILogin';
import nodemailer from 'nodemailer';
import { accountService } from '@/lib/account/IAccountInfosService';
import { mountSendTask } from '@/lib/task/helper';

export type ResponseSendTaskApi = {
  status: number;
  error: string | null;
  content?: string;
};

async function sendEmail(prefixCompany:string, data: any) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    requireTLS: true,
    auth: {
      user: 'sender@bid.log.br',
      pass: 'Sender@bid#123',
    },
    logger: true,
  });

  const mailData = {
    from: '"Tabelas (bid.log.br)" <sender@bid.log.br>',
    to: 'tabelas@bid.log.br',
    subject: `${prefixCompany} - Tabela pelo formulário do site`,
    text: JSON.stringify(data),
    headers: { 'x-myheader': 'test header' },
  };

  transporter.sendMail(mailData, (err) => {
    if (err) {
      throw new Error('erro ao enviar email');
    }
  });
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
    street, number, neighborhood, city, state, cep, complement, reference, phone, recipient, type, declaredValue,
  } = JSON.parse(req.body);

  try {
    await sendEmail(username.toString(), JSON.parse(req.body));
  } catch (error) {
    res.status(500).json({ status: 500, error: `erro ao enviar email ${error}` });
  }

  const { client } = accountInfos;

  try {
    const orderNumber = `${client.prefix}-${randomInt(100000)}`;
    const data = mountSendTask(
      street,
      number,
      neighborhood,
      city,
      state,
      cep,
      complement,
      reference,
      orderNumber,
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
    res.status(200).json({ status: 200, error: null, content: orderNumber });
  } catch (e) {
    res.status(500).json({ status: 500, error: `${e}` });
  }
};

export default handler;
