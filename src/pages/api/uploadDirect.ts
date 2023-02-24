import { deliveryService } from '@/lib/deliverySystem/IDeliveryService';
import { loginImplementation } from '@/lib/login/implementations/enviroment';
import { SendTask } from '@/lib/types/SendTask';
import { csvToJson } from '@/lib/util/convertions';
import moment from 'moment';
import type { NextApiRequest, NextApiResponse } from 'next';
import { parseForm, FormidableError } from '../../lib/util/parse-form';

export type ResponseUploadApi = {
  status: number;
  error: string | null;
  content?: any;
};
type Template =
  {
    Task_id: number,
    Name: string,
    Phone_number: string,
    Email_id: string,
    FlatNo: string,
    Area: string,
    Address: string,
    Pincode: string,
    Description: string,
    Agent: string,
    Team: string,
    Order_id: string,
    Task_Type: string,
    Distance: string,
    Task_status: string,
    Latitude: number,
    Longitude: number,
    Rating: string,
    Comment: string,
    notes: string,
    barcode: string,
    signature: string,
    Images: string,
    Ref_Image: string,
    Delay: string,
    Start_Before: string,
    Complete_Before: string,
    Started_Time: string,
    Completion_Time: string,
    Total_Time_Taken: number,
    Created_By: string,
    "Categoria de envio": string,
    Reentrega: boolean,
    Devolução: boolean
  }

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
  const passCompany = req.headers['x-authentication'];
  const tokenSession = req.headers['x-token'];

  if (!prefixCompany || !passCompany || !tokenSession) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

  const { token, isAdmin } = await loginImplementation.authenticate(prefixCompany.toString(), passCompany.toString(), tokenSession.toString());

  if (!token) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

  if (!isAdmin) {
    res.status(401).json({ status: 401, error: 'Credenciais inválidas' });
    return;
  }

let responses: ResponseUploadApi[]=[];

  try {
    const { files } = await parseForm(req);

    const file = files.media;
    const url = Array.isArray(file) ? file.map((f) => f.filepath) : file.filepath;
    console.log("🚀 ~ file: uploadDirect.ts:90 ~ handler ~ url:", url)

    const tasks = await csvToJson(url.toString()) as Template[];
    console.log("🚀 ~ file: uploadDirect.ts:92 ~ handler ~ tasks:", tasks)
    for (const task of tasks) {
      try {
        const orderNumber = task.Order_id;
        const prefix = orderNumber.split('-')[0];
        const data: SendTask = {
          address: task.Address,
          complement: task.FlatNo,
          phone: task.Phone_number,
          name: task.Name,
          value: '10.00',
          startDate: moment(task.Start_Before).format('YYYY-MM-DDThh:mm:ss'),
          endDate: moment(task.Complete_Before).format('YYYY-MM-DDThh:mm:ss'),
          reference: task.notes,

          description: task.Description,
          email: 'sender@bid.log.br',
          orderNumber: orderNumber,

          account: prefix.toString(),
          deliveryType: task['Categoria de envio'],
        };
        const response = await deliveryService.sendTask(data);
        if (response?.error || !response?.content) {          
          responses.push({ status: 500, error: response.error.toString() })
          continue;
        }
        responses.push({ status: 200, error: null, content: orderNumber });
      } catch (e) {
        console.error(e);
        responses.push({ status: 500, error: `${e}` });
      }
    }
    
    const hasSuccess = !!responses.find(r => r.status == 200);
    if (hasSuccess)
      res.status(200).json(responses);
    
    res.status(500).json(responses);
  } catch (e) {
    if (e instanceof FormidableError) {
      res.status(e.httpCode || 400).json({ status: 400, error: e.message });
    } else {
      console.error(e);
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
