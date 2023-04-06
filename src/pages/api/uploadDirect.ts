/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { deliveryService } from '@/lib/task/IDeliveryService';
import { SendTask } from '@/lib/types/SendTask';
import moment from 'moment';
import type { NextApiRequest, NextApiResponse } from 'next';
import { loginService } from '@/lib/user/login/ILogin';
import { accountService } from '@/lib/account/IAccountInfosService';
import { xlsxToJson } from '@/lib/helpers/xlsx';
import { parseForm, FormidableError } from '../../lib/helpers/parse-form';

export type ResponseUploadApi = {
  status: number;
  error: string | null;
  content?: any;
};
type Template =
  {
    Name: string,
    Phone_number: string,
    FlatNo: string,
    Address: string,
    Description: string,
    Order_id: string,
    notes: string,
    Start_Before: string,
    Complete_Before: string,
    tipo: string,
    valor: string
  };

const handler = async (req: NextApiRequest, res: NextApiResponse<ResponseUploadApi | ResponseUploadApi[]>) => {
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
  const account = req.headers['x-account'];

  if (!username || !tokenSession || !account) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

  const { token, id, isAdmin } = await loginService.authenticate(username.toString(), tokenSession.toString());

  if (!token || !id) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

  const configSendTask = await accountService.getAccountInfoByAccountID(account.toString());

  if (!configSendTask) {
    res.status(500).json({ status: 500, error: `sem configuração encontrada, account ${id}` });
    return;
  }

  if (!isAdmin) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

  const {
    driver, key, model, rule, team,
  } = configSendTask;
  const responses: ResponseUploadApi[] = [];

  try {
    const { files } = await parseForm(req, false, true);

    const file = files.media;
    const url = Array.isArray(file) ? file.map((f) => f.filepath)[0] : file.filepath;

    const tasks = await xlsxToJson(url.toString()) as Template[];
    for (const task of tasks) {
      try {
        const orderNumber = task.Order_id;
        const data: SendTask = {
          address: task.Address,
          complement: task.FlatNo,
          phone: task.Phone_number,
          name: task.Name,
          value: task.valor,
          startDate: `${moment(new Date(task.Start_Before)).format('YYYY-MM-DD')}T08:00:00.830Z`,
          endDate: `${moment(new Date(task.Complete_Before)).format('YYYY-MM-DD')}T23:00:00.830Z`,
          reference: task.notes,
          description: task.Description,
          email: 'sender@bid.log.br',
          orderNumber,
          type: task.tipo,
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
