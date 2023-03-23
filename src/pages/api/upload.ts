/* eslint-disable no-restricted-syntax */
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { loginService } from '@/lib/user/login/ILogin';

import { csvToJson } from '@/lib/util/convertions';
import { SendTask } from '@/lib/types/SendTask';
import { deliveryService } from '@/lib/task/IDeliveryService';
import { dateByDeliveryType } from '@/lib/util/rules';
import { accountService } from '@/lib/account/IAccountInfosService';
import { AccountInfo } from '@/lib/types/AccountInfo';
import { parseForm, FormidableError } from '../../lib/util/parse-form';

export type ResponseUploadApi = {
  status: number;
  error: string | null;
  content?: any;
};

type Template =
  {
    'Nome': string,
    'Celular': string,
    'Email':string,
    'Pedido':string,
    'Rua/Avenida/Travessa': string,
    'Número': string,
    'Bairro': string,
    'CEP': string,
    'Complemento': string,
    'Ponto de referência': string,
    'Categoria de envio': string,
    'Cidade':string,
    'Estado':string
  };

async function sendTasksbyFile(url: string, configSendTask: AccountInfo) {
  let tasks = [];
  const responses: ResponseUploadApi[] = [];
  const collectionAddress = configSendTask.client.address;

  try {
    tasks = await csvToJson(url.toString(), ',') as Template[];
  } catch (e) {
    tasks = await csvToJson(url.toString(), ';') as Template[];
  }
  const {
    driver, key, model, rule, team,
  } = configSendTask;
  for (const task of tasks) {
    try {
      const orderNumber = task.Pedido;
      const data: SendTask = {
        address: `${task['Rua/Avenida/Travessa']}, ${task['Número']} - ${task.Bairro}, ${task.Cidade} - ${task.Estado}, ${task.CEP} Brazil`,
        complement: `${task.Complemento}, ${task['Ponto de referência']}`,
        phone: task.Celular,
        name: `[${orderNumber}] ${task.Nome}`,
        value: '10.00',
        startDate: dateByDeliveryType(task['Categoria de envio']).format('YYYY-MM-DDThh:mm:ss'),
        endDate: dateByDeliveryType(task['Categoria de envio']).add(1, 'hour').format('YYYY-MM-DDThh:mm:ss'),
        reference: task['Ponto de referência'],
        description: collectionAddress,
        email: 'sender@bid.log.br',
        orderNumber,
        type: task['Categoria de envio'],
        driver,
        key,
        model,
        rule,
        team,
      };
      const response = await deliveryService.sendTask(data);
      if (response?.error || !response?.content) {
        responses.push({ content: orderNumber, status: 500, error: JSON.stringify(response.error) });
        continue;
      }
      responses.push({ status: 200, error: null, content: orderNumber });
    } catch (e) {
      responses.push({ status: 500, error: `${e}` });
    }
  }
  return responses;
}

const handler = async (req: NextApiRequest, res: NextApiResponse<ResponseUploadApi[] | ResponseUploadApi | null>) => {
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

  const configSendTask = await accountService.getAccountInfosByUserID(id.toString());

  if (!configSendTask) {
    res.status(500).json({ status: 500, error: `sem configuração encontrada, user ${id}` });
    return;
  }

  if (!configSendTask.client.allowInlote) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }
  try {
    const { files } = await parseForm(req);

    const file = files.media;
    const url = Array.isArray(file) ? file.map((f) => f.filepath) : file.filepath;
    const name = Array.isArray(file) ? file.map((f) => f.newFilename) : file.newFilename;

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
      text: 'Em anexo',
      headers: { 'x-myheader': 'test header' },
      attachments: [
        {
          filename: name.toString(),
          path: url.toString(),
        },
      ],
    };

    transporter.sendMail(mailData, (err) => {
      if (err) {
        res.status(500).json({ status: 500, error: 'Erro ao enviar e-mail' });
      }
    });

    const responses = await sendTasksbyFile(url.toString(), configSendTask);
    const hasSuccess = !!responses.find((r) => r.status === 200);
    if (hasSuccess) { res.status(200).json(responses); } else { res.status(500).json(responses); }
  } catch (e) {
    if (e instanceof FormidableError) {
      res.status(e.httpCode || 400).json({ status: 400, error: e.message });
    } else {
      res.status(500).json({ status: 500, error: 'Erro interno' });
    }
    res.status(500).json({ status: 500, error: 'Erro interno' });
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
