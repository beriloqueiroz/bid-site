import { Account, AccountInfo, TrackingTaskConfig } from '../types/AccountInfo';
import { accountInfosSQL } from './implementations/accountInfosSQL';

export interface IAccountInfosService {
  getTrackingKeysByUserID(userID: string): Promise<TrackingTaskConfig[]>;
  getAccountInfosByUserID(userID: string): Promise<AccountInfo | null>;
  getAccountInfoByAccountID(id:string): Promise<Account | null>;
}

export const accountService: IAccountInfosService = accountInfosSQL;
