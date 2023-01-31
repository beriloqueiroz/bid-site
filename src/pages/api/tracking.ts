// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next'

type Order = {
  _id: string,
  isDeleted: number,
  name: string,
  email: string,
  date: string,
  endDate: string,
  address: {
    formatted_address: string,
    geometry: any
  },
  phone: string
  businessType: number
  orderId: string
  taskStatus: number
  taskId: string
  created_at: string
}

type TaskLog = {
  _id: string
  isDeleted: number,
  role: number,
  taskStatus: string
  taskId: string
  clientId: string
  driverName: string
  user: string
  distanceTravelled: number,
  created_at: string
  __v: number
}

type TaskLogDTO = {
  _id: string
  role: number,
  taskStatus: string
  taskId: string
  clientId: string
  driverName: string
  user: string
  distanceTravelled: number,
  created_at: string
  name: string,
  date: string,
  endDate: string,
  orderId: string
  address: {
    formatted_address: string,
  },
}

async function get(url: string, auth: string): Promise<any> {
  var result = null;
  const headers = {
    "Content-Type": "application/json",
    apiKey: auth,
  };
  await axios({
    method: 'get',
    url: url,
    headers: {
      ...headers,
    },
  }).then(function (response) {
    result = response.data;
  }).catch(function (error) {
    throw new Error(`url: ${url},headers : ${JSON.stringify(headers)} error: ${JSON.stringify(error?.response?.data)}` + JSON.stringify(error));
  });
  return result;
}

async function getHistory(orderNumber: string): Promise<TaskLogDTO[] | null | undefined> {
  const urlbase = process.env.URL_BASE_DELIFORCE;

  if (orderNumber.indexOf("-") < 0) {
    return null;
  }

  const prefix = orderNumber.slice(0, orderNumber.indexOf("-"))
  const orderNumberWithoutPrefix = orderNumber.slice(orderNumber.indexOf("-") + 1, orderNumber.length)

  const generalAuth = process.env['CONFIG_' + prefix] as string;

  if (!generalAuth) return null;

  const keys = JSON.parse(generalAuth) as string[];

  for (const key of keys) {
    let orders = await get(urlbase + `/task/orderid?orderId=${orderNumberWithoutPrefix}`, key) as Order[];
    if (orders.length > 0) {
      let order = orders.find(resp => !resp.isDeleted);
      if (!order) return null;
      const histories: TaskLog[] = await getTaskLog(order.taskId, key);
      const historyDTOs: TaskLogDTO[] = histories.map(hist => ({
        ...hist,
        name: order?.name || "",
        date: order?.date || "",
        endDate: order?.endDate || "",
        orderId: order?.orderId || "",
        address: {
          formatted_address: order?.address.formatted_address || "",
        },
      }));
      return historyDTOs;
    }
  }

  return null;
}

async function getTaskLog(taskId: string, key: string) {
  const urlbase = process.env.URL_BASE_DELIFORCE;


  let responseData = await get(urlbase + `/task/tasklog?taskId=${taskId}`, key);
  if (responseData.length > 0) return responseData;

  return [];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TaskLogDTO[] | null | undefined>
) {
  const param = req.query;

  let history = await getHistory(`${param["order"]}`);
  let response = history?.map(hist => ({
    ...hist,
    taskStatus: getDescStatus(hist.taskStatus)
  }))

  res.status(200).json(response)
}

function getDescStatus(status: string) {
  const st = [
    'Não atribuído',
    'Assigned',
    'Aceito',
    'Iniciado',
    'Chegou',
    'Entregue com sucesso',
    'Falha na entrega',
    'Devolvido',
    'Cancelado',
    'Reconhecido',
    '',
    '',
    '',
    'Excluído'
  ]
  const getDescStatus = st[parseInt(status) - 1];
  return getDescStatus;
}
