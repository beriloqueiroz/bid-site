import { SendTask } from '@/lib/types/SendTask';
import { TaskLogDTO } from '@/lib/types/TaskLogDTO';

import { ResponseDefault } from '../types/Response';
import { TrackingTaskConfig } from '../types/AccountInfo';
import { deliforceImplementation } from './implementations/deliforce';

interface IDeliveryService {
  getTrackingHistory(orderNumber: string, configs: TrackingTaskConfig[]): Promise<TaskLogDTO | null>;
  sendTask(task: SendTask): Promise<ResponseDefault>;
}

export const deliveryService: IDeliveryService = deliforceImplementation;
