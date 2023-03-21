/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { deliveryService } from '@/lib/deliverySystem/IDeliveryService';
import { SendTask } from '@/lib/types/SendTask';
import { csvToJson } from '@/lib/util/convertions';
import moment from 'moment';
import type { NextApiRequest, NextApiResponse } from 'next';
import { loginService } from '@/lib/user/login/ILogin';
import { parseForm, FormidableError } from '../../lib/util/parse-form';

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
    'Categoria de envio': string,
    Reentrega: boolean,
    'Devolução': boolean
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

  const prefixCompany = req.headers['x-company'];
  const tokenSession = req.headers['x-token'];
  const accountEmail = req.headers['x-account'];

  if (!prefixCompany || !tokenSession || !accountEmail) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

  const { token, isAdmin } = await loginService.authenticate(prefixCompany.toString(), tokenSession.toString());

  if (!token) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

  if (!isAdmin) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

  const responses: ResponseUploadApi[] = [];

  try {
    const { files } = await parseForm(req);

    const file = files.media;
    const url = Array.isArray(file) ? file.map((f) => f.filepath) : file.filepath;

    let tasks = [];

    try {
      tasks = await csvToJson(url.toString(), ';') as Template[];
    } catch (e) {
      tasks = await csvToJson(url.toString(), ',') as Template[];
    }
    for (const task of tasks) {
      try {
        const orderNumber = task.Order_id;
        const data: SendTask = {
          address: task.Address,
          complement: task.FlatNo,
          phone: task.Phone_number,
          name: task.Name,
          value: '10.00',
          startDate: `${moment(task.Start_Before).format('YYYY-MM-DD')}T08:00:00.830Z`,
          endDate: `${moment(task.Complete_Before).format('YYYY-MM-DD')}T23:00:00.830Z`,
          reference: task.notes,

          description: task.Description,
          email: 'sender@bid.log.br',
          orderNumber,

          account: accountEmail?.toString(),
          deliveryType: task['Categoria de envio'],

          dynamicKey: accountEmail?.toString(),
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
