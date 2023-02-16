import { SendTask } from "@/lib/types/SendTask";
import { TaskLogDTO } from "@/lib/types/TaskLogDTO";
import { ResponseDefault } from "../types/Response";
import { deliforceImplementation } from "./implementations/deliforce";

interface IDeliveryService {
    getTrackingHistory(taskId: string): Promise<TaskLogDTO | null>;
    sendTask(task: SendTask): Promise<ResponseDefault>;
}

export const deliveryService: IDeliveryService = deliforceImplementation;