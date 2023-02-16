
import { deliveryService } from '@/lib/deliverySystem/IDeliveryService';
import { TaskLogDTO } from '@/lib/types/TaskLogDTO';
import type { NextApiRequest, NextApiResponse } from 'next'


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TaskLogDTO | null | undefined>
) {
  const param = req.query;

  let history = await deliveryService.getTrackingHistory(`${param["order"]}`);

  res.status(200).json(history)
}
