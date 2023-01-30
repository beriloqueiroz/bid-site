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

type OrderDTO = {
  name: string,
  date: string,
  endDate: string,
  orderId: string
  taskStatus: string
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

async function getOrderByNumber(orderNumber: string): Promise<Order[]> {
  const urlbase = process.env.URL_BASE_DELIFORCE;
  const auth = process.env.SECRET_API_DELIFORCE_1 as string;
  let responseData = await get(urlbase + `/task/orderid?orderId=${orderNumber}`, auth);
  console.log('resposne data', responseData)

  if (responseData.length <= 0) return [];
  return responseData;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OrderDTO[]>
) {
  const param = req.query;

  const response: Order[] = await getOrderByNumber(`${param["order"]}`);
  const responseDTO = response.map((elem: Order) => ({
    date: elem.date,
    address: {
      formatted_address: elem.address.formatted_address
    },
    endDate: elem.endDate,
    name: elem.name,
    orderId: elem.orderId,
    taskStatus: getDescStatus(elem.taskStatus)
  })) as OrderDTO[];
  res.status(200).json(responseDTO)
}

function getDescStatus(status: number) {
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
  const getDescStatus = st[status - 1];
  return getDescStatus;
}
