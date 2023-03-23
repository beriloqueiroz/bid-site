import { AccountInfo, TrackingTaskConfig } from '../types/AccountInfo';
import { accountInfosSQL } from './implementations/accountInfosSQL';

export interface IAccountInfosService {
  getTrackingKeysByUserID(userID: string): Promise<TrackingTaskConfig[]>;
  getAccountInfosByUserID(userID: string): Promise<AccountInfo | null>;
  getAccountInfoByAccountID(id:string): Promise<AccountInfo | null>;
}

export const accountService: IAccountInfosService = accountInfosSQL;
