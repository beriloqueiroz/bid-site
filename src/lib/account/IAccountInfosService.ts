import { Account, AccountInfo, TrackingTaskConfig } from '../types/AccountInfo';
import { accountInfosSQL } from './implementations/accountInfosSQL';

export interface IAccountInfosService {
  getTrackingKeysByUserID(userID: string): Promise<TrackingTaskConfig[]>;
  getAccountInfosByUserID(userID: string): Promise<AccountInfo | null>;
  getAccountInfoByAccountID(id:string): Promise<Account | null>;
  listAccountInfos(): Promise<AccountInfo[]>
  createAccountInfo(info:AccountInfo):Promise<CreateResponse | null>;
}
export type CreateResponse = { ok:Boolean, user:string, pass:string };
export const accountService: IAccountInfosService = accountInfosSQL;
