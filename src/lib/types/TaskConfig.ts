export interface SendTaskConfig {
  key: string;
  driver:string;
  team:string;
  rule:string;
  model:string;
  prefix: string;
  address: string;
}

export interface TrackingTaskConfig {
  key: string;
  name: string;
  id: string;
}
