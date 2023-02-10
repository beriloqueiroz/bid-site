// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getDescStatus, getTaskByOrder, getTaskLog } from '@/lib/deliforce/service';
import { TaskLogDTO } from '@/lib/types/TaskLogDTO';
import { countValidDays } from '@/lib/util/rules';
import moment, { now } from 'moment';
import type { NextApiRequest, NextApiResponse } from 'next'

async function getHistory(orderNumber: string): Promise<TaskLogDTO | null> {
  if (orderNumber.indexOf("-") < 0) {
    return null;
  }

  const prefix = orderNumber.slice(0, orderNumber.indexOf("-"))

  const generalAuth = process.env['CONFIG_' + prefix] as string;

  if (!generalAuth) return null;

  const keys = JSON.parse(generalAuth) as string[];

  for (const key of keys) {
    const order = await getTaskByOrder(orderNumber, key);

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


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TaskLogDTO | null | undefined>
) {
  const param = req.query;

  let history = await getHistory(`${param["order"]}`);

  res.status(200).json(history)
}
