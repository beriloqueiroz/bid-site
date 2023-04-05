/* eslint-disable no-restricted-syntax */
import type { NextApiRequest, NextApiResponse } from 'next';
import { loginService } from '@/lib/user/login/ILogin';

import { deliveryService } from '@/lib/task/IDeliveryService';
import { accountService } from '@/lib/account/IAccountInfosService';
import { AccountInfo } from '@/lib/types/AccountInfo';
import { mountSendTask } from '@/lib/task/helper';
import { xlsxToJson } from '@/lib/helpers/xlsx';
import { MailService } from '@/lib/mail/IMailService';
import { parseForm, FormidableError } from '../../lib/helpers/parse-form';

export type ContentResponseUpload = {
  status: number;
  error: string | null;
  content? :any
};

export type ResponseUploadApi = {
  status: number;
  error: string | null;
  content?: ContentResponseUpload[];
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
    'Estado':string,
    'Cidade':string,
    'CEP': string,
    'Complemento': string,
    'Ponto de referência': string,
    'Categoria de envio': string,
    'Valor da mercadoria':number
  };

async function sendTasksbyFile(url: string, accountInfos: AccountInfo) {
  const responses: ContentResponseUpload[] = [];

  const tasks = await xlsxToJson(url.toString(), 'main') as Template[];

  for (const task of tasks) {
    const orderNumber = task.Pedido;
    try {
      const data = mountSendTask(
        task['Rua/Avenida/Travessa'],
        task['Número'],
        task.Bairro,
        task.Cidade,
        task.Estado,
        task.CEP,
        task.Complemento,
        task['Ponto de referência'],
        orderNumber,
        task.Nome,
        task['Valor da mercadoria'],
        accountInfos,
        task.Celular.toString(),
        task['Categoria de envio'],
      );

      const response = await deliveryService.sendTask(data);
      if (response?.error || !response?.content) {
        responses.push({ content: orderNumber, status: 500, error: JSON.stringify(response.error) });
        continue;
      }
      responses.push({ status: 200, error: null, content: orderNumber });
    } catch (e) {
      responses.push({ status: 500, error: `${e}`, content: orderNumber });
    }
  }
  return responses;
}

async function sendEmail(url:string, name:string, username:string) {
  return MailService.sendEmail(
    '"Tabelas (bid.log.br)" <sender@bid.log.br>',
    'tabelas@bid.log.br',
    `${username} - Tabela pelo formulário do site`,
    'Em anexo',
    [{ filename: name, path: url }],
  );
}

const handler = async (req: NextApiRequest, res: NextApiResponse<ResponseUploadApi>) => {
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
    const { files } = await parseForm(req, false, true);

    const file = files.media;
    const url = Array.isArray(file) ? file.map((f) => f.filepath) : file.filepath;
    const name = Array.isArray(file) ? file.map((f) => f.newFilename) : file.newFilename;

    const resultSentEmail = await sendEmail(url.toString(), name.toString(), username.toString());

    if (!resultSentEmail || resultSentEmail.err) {
      res.status(500).json({ status: 500, content: [], error: 'erro ao enviar email com tabela' });
    }

    const responses = await sendTasksbyFile(url.toString(), configSendTask);
    const hasSuccess = !!responses.find((r) => r.status === 200);
    if (hasSuccess) {
      res.status(200).json({ status: 200, content: responses, error: null });
    } else {
      res.status(500).json({ status: 500, content: responses, error: 'nenhum pedido com sucesso' });
    }
  } catch (e) {
    if (e instanceof FormidableError) {
      res.status(e.httpCode || 400).json({ status: 400, error: e.message });
    } else {
      res.status(500).json({ status: 500, error: 'Erro interno' });
    }
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
