import { Task } from "./Task"
import { TaskLog } from "./TaskLog"


export interface TaskLogDTO {
    task: Task
    history: TaskLog[]
}