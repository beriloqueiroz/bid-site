import { Client } from './Client';

export interface AccountInfo {
  keyId?: number;
  key: string;
  driver:string;
  team:string;
  rule:string;
  model:string;
  client: Client;
}

export interface Account {
  key: string;
  driver:string;
  team:string;
  rule:string;
  model:string;
}

export interface TrackingTaskConfig {
  key: string;
  name: string;
  id: string;
}
