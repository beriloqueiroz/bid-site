import { SendTaskConfig, TrackingTaskConfig } from '../types/TaskConfig';
import { myAccountSQLImplementation } from './implementations/myAccountSQLImplementation';

interface IAccountService {
  getTrackingKeysByUserID(userID: string): Promise<TrackingTaskConfig[]>;
  getSendInfosByUserID(userID: string): Promise<SendTaskConfig | null>;
  getSendInfoByAccountID(id:string): Promise<SendTaskConfig | null>;
}

export const accountService: IAccountService = myAccountSQLImplementation;
