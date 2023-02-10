// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Task } from '@/lib/types/Task';
import { TaskLog } from '@/lib/types/TaskLog';
import { TaskLogDTO } from '@/lib/types/TaskLogDTO';
import axios from 'axios';
import moment, { now } from 'moment';
import type { NextApiRequest, NextApiResponse } from 'next'

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
    console.error(`url: ${url},headers : ${JSON.stringify(headers)} error: ${JSON.stringify(error?.response?.data)}` + JSON.stringify(error));
  });
  return result;
}

async function getHistory(orderNumber: string): Promise<TaskLogDTO | null> {
  if (orderNumber.indexOf("-") < 0) {
    return null;
  }

  const prefix = orderNumber.slice(0, orderNumber.indexOf("-"))
  const orderNumberWithoutPrefix = orderNumber.slice(orderNumber.indexOf("-") + 1, orderNumber.length)

  const generalAuth = process.env['CONFIG_' + prefix] as string;

  if (!generalAuth) return null;

  const keys = JSON.parse(generalAuth) as string[];

  for (const key of keys) {
    const order = await getTaskByOrder(orderNumberWithoutPrefix, key);

    if (!order) return null;

    const histories = await getTaskLog(order.taskId, key);
    const historyResponse: TaskLogDTO = {
      history: histories,
      task: {
        ...order,
        name: order?.name || "",
        date: moment(order?.date).format(
          "DD/MM/YYYY hh:mm:ss A"
        ) || "",
        endDate: moment(order?.endDate).format(
          "DD/MM/YYYY hh:mm:ss A"
        ) || "",
        orderId: order?.orderId || "",
        taskDescStatus: getDescStatus(order?.taskStatus || ""),
        address: {
          ...order?.address,
          formatted_address: order?.address.formatted_address || "",
        },
        forecast: countValidDays(order?.date || now().toString(), getForecast("NORMAL"))
      }
    };
    return historyResponse;
  }
  return null;
}

function getForecast(type: string): number {
  let ret = 1;
  if (type == "EXPRESSO")
    ret = 0;
  if (type == "LENTO")
    ret = 2;
  return ret;
}

function countValidDays(startDate: string, forecast: Number, validWeekDays: number[] = [1, 2, 3, 4, 5]): string {
  let count = 0;
  let forecastDate = moment(startDate);
  while (count < forecast) {
    forecastDate = forecastDate.add(1, "days");
    const weekday = forecastDate.isoWeekday();
    if (validWeekDays.includes(weekday)) {
      count++;
    }
  }
  return forecastDate.set({ h: 20, m: 0 }).format(
    "DD/MM/YYYY hh:mm:ss A"
  );
}

async function getTaskLog(taskId: string, key: string): Promise<TaskLog[]> {
  const urlbase = process.env.URL_BASE_DELIFORCE;
  let responseData = await get(urlbase + `/task/tasklog?taskId=${taskId}`, key) as TaskLog[];
  if (!responseData) return [];
  if (!responseData.length) return [];
  return responseData.map(hist => ({
    ...hist,
    created_at: moment(hist.created_at).format(
      "DD/MM/YYYY hh:mm:ss A"
    ) || "",
    taskDescStatus: getDescStatus(hist.taskStatus, hist.notes, hist.imageArry),
  }));
}

async function getTaskByOrder(orderNumber: string, key: string): Promise<Task | null> {
  const urlbase = process.env.URL_BASE_DELIFORCE;
  let tasks = await get(urlbase + `/task/orderid?orderId=${orderNumber}`, key) as Task[];
  if (!tasks.length)
    return null;
  let task = tasks.find(resp => !resp.isDeleted);
  if (!task) return null;
  return task;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TaskLogDTO | null | undefined>
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
function getDescStatus(taskStatus: string, notes?: string, imageArry?: string[]): string {
  const st = [
    {
      in: "2",
      out: 'Arquivo de transporte recebido'
    },
    {
      in: "3",
      out: 'Pacote aceito pelo Entregador'
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
    },
    {
      in: "10",
      out: 'Pacote coletado pelo Entregador'
    },
    {
      in: "18",
      out: 'Dados de entrega atualizados - Nova tentativa de entrega'
    }
  ]
  const getDescStatus = st.find(s => s?.in == taskStatus);

  let toReturn = "";

  if (getDescStatus)
    toReturn = getDescStatus.out;

  if (notes)
    toReturn = "Nota de entrega adicionada";

  if (imageArry && imageArry?.length > 0)
    toReturn = "Protocolo de entrega adicionado";

  return toReturn;
}
