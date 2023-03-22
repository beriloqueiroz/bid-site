import { deliveryService } from '@/lib/task/IDeliveryService';
import { SendTask } from '@/lib/types/SendTask';
import { dateByDeliveryType } from '@/lib/util/rules';
import { randomInt } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { loginService } from '@/lib/user/login/ILogin';
import nodemailer from 'nodemailer';
import { accountService } from '@/lib/account/IAccountService';

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

  const prefixCompany = req.headers['x-username'];
  const tokenSession = req.headers['x-token'];

  if (!prefixCompany || !tokenSession) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

  const { token, id } = await loginService.authenticate(prefixCompany.toString(), tokenSession.toString());

  if (!token || !id) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

  const configSendTask = await accountService.getSendInfosByUserID(id.toString());

  if (!configSendTask) {
    res.status(500).json({ status: 500, error: `sem configuração encontrada, user ${id}` });
    return;
  }

  const {
    street, number, neighborhood, city, state, cep, complement, reference, phone, recipient, type,
  } = JSON.parse(req.body);

  try {
    await sendEmail(prefixCompany.toString(), JSON.parse(req.body));
  } catch (error) {
    res.status(500).json({ status: 500, error: `erro ao enviar email ${error}` });
  }

  const {
    driver, key, model, rule, team,
  } = configSendTask;

  try {
    const orderNumber = `${prefixCompany}-${randomInt(100000)}`;
    const data: SendTask = {
      address: `${street}, ${number} - ${neighborhood}, ${city} - ${state}, ${cep} Brazil`,
      complement: `${complement}, ${reference}`,
      phone,
      name: `[${orderNumber}] ${recipient}`,
      value: '10.00',
      startDate: dateByDeliveryType(type).format('YYYY-MM-DDThh:mm:ss'),
      endDate: dateByDeliveryType(type).add(1, 'hour').format('YYYY-MM-DDThh:mm:ss'),
      reference,
      description: configSendTask.address,
      email: 'sender@bid.log.br',
      orderNumber,
      type,
      driver,
      key,
      model,
      rule,
      team,
    };
    const response = await deliveryService.sendTask(data);
    if (response?.error || !response?.content) {
      res.status(500).json({ status: 500, error: response.error.toString() });
      return;
    }
    res.status(200).json({ status: 200, error: null, content: orderNumber });
  } catch (e) {
    res.status(500).json({ status: 500, error: `${e}` });
  }
};

export default handler;
