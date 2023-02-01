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
  taskStatus: string | null | undefined
  taskId: string
  created_at: string
}

type TaskLog = {
  _id: string
  isDeleted: number,
  role: number,
  taskStatus: string | null | undefined
  taskId: string
  clientId: string
  driverName: string
  user: string
  distanceTravelled: number,
  created_at: string
  __v: number
  reason: string
  imageArry: string[]
  notes: string
}

type TaskLogDTO = {
  _id: string
  role: number,
  taskStatus: string | null | undefined
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
  reason: string
  imageArry: string[]
  notes: string
  taskDescStatus: string | null | undefined
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
        taskDescStatus: getDescStatus(hist),
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

  res.status(200).json(history)
}
/*
Unassigned	1	Task not assigned to any driver
Assigned	2	Task assigned to driver
Accepted	3	Task accepted by driver
Started	4	Task is started by driver
Arrived	5	Driver has arrived to task Location
Success	6	Task completed successfully
Fail	7	Task Failed
Declined	8	Task declined by driver
Cancelled	9	Task cancelled by driver
Acknowledged	10	Task Acknowledged by driver
Deleted	14	Deleted Task

Tarefa criada 		---> Nenhum status
Tarefa atribuida 	---> Arquivo de transporte recebido
Tarefa reconhecida   —-> Pacote coletado pelo Entregador
Tarefa iniciada		---> Pacote em rota de entrega
Tarefa falhou		---> Falha na Entrega
Tarefa atualizada	---> Dados de entrega atualizados - Nova tentativa de entrega
Imagem adicionada	---> Protocolo de entrega adicionado
Notas adicionada	---> Nota de entrega adicionada
Tarefa sucedida		---> Pacote entregue com sucesso
Tarefa chegando		---> O Entregador está próximo ao endereço de destino
Tarefa cancelada	---> Entrega cancelada
*/
function getDescStatus(task: TaskLog): string | undefined | null {
  const st = [
    {
      in: "2",
      out: 'Arquivo de transporte recebido'
    },
    {
      in: "3",
      out: 'Pacote coletado pelo Entregador'
    },
    {
      in: "4",
      out: 'Pacote em rota de entrega'
    },
    {
      in: "5",
      out: 'O Entregador está próximo ao endereço de destino'
    },
    {
      in: "6",
      out: 'Pacote entregue com sucesso'
    },
    {
      in: "7",
      out: 'Falha na Entrega'
    },
    {
      in: "8",
      out: 'Entrega abortada'
    },
    {
      in: "9",
      out: 'Entrega cancelada'
    }
  ]
  const getDescStatus = st.find(s => s.in == task.taskStatus);
  if (getDescStatus)
    return getDescStatus.out;

  if (task.notes)
    return "Nota de entrega adicionada";

  if (task.imageArry?.length > 0)
    return "Protocolo de entrega adicionado";

  return "Dados de entrega atualizados - Nova tentativa de entrega";
}
