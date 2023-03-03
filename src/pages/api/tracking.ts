import { deliveryService } from '@/lib/deliverySystem/IDeliveryService';
import { TaskLogDTO } from '@/lib/types/TaskLogDTO';
import moment from 'moment';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<TaskLogDTO | null | undefined>) {
  const param = req.query;

  const history = await deliveryService.getTrackingHistory(`${param['order']}`);

  if (history) {
    history.task.name = parseRecipient(history.task.name);
  }

  res.status(200).json(history);
}
function parseRecipient(value: string) {
  if (value.includes('')) {
    return value.split(']')[1];
  }
  return value;
}
