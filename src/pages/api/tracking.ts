import { accountService } from '@/lib/account/IAccountInfosService';
import { deliveryService } from '@/lib/task/IDeliveryService';
import { TaskLogDTO } from '@/lib/types/TaskLogDTO';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<TaskLogDTO | null | undefined>) {
  function parseRecipient(value: string) {
    if (value.includes('')) {
      return value.split(']')[1];
    }
    return value;
  }
  const param = req.query;

  const configs = await accountService.getTrackingKeysByUserID('');

  const history = await deliveryService.getTrackingHistory(`${param.order}`, configs);

  if (history) {
    history.task.name = parseRecipient(history.task.name);
  }

  res.status(200).json(history);
}
