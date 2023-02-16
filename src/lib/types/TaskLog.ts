export type TaskLog = {
  _id: string;
  isDeleted: number;
  role: number;
  taskStatus: string;
  taskId: string;
  clientId: string;
  driverName: string;
  user: string;
  distanceTravelled: number;
  created_at: string;
  __v: number;
  reason: string;
  imageArry: string[];
  notes: string;

  taskDescStatus: string;
};
