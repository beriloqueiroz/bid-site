import { Client } from '@/lib/types/Client';

export type User = {
  isLogged: boolean,
  userName: string,
  identification: string,
  token: string,
};

export const initialUser: User = {
  isLogged: false,
  userName: '',
  identification: '',
  token: '',
};

export type Error = {
  hasError: boolean,
  message: string
};

export const initialError:Error = {
  hasError: false,
  message: '',
};

export const initialClient:Client = {
  address: '',
  allowInlote: false,
  corporateName: '',
  name: '',
  prefix: '',
  prices: { capital: { d: 15, d1: 10 }, metropolitana: { d: 20, d1: 15 }, gain: 2 },
};

export const initialAccountsToSend: { content :{ name:string, id:string }[] } = { content: [{ name: '', id: '' }] };
export type GeneralState = {
  user: User,
  error: Error,
  client: Client,
  accountsToSend:{ content :{ name:string, id:string }[] }
};

const initialState: GeneralState = {
  user: initialUser,
  error: initialError,
  client: initialClient,
  accountsToSend: initialAccountsToSend,
};

export default initialState;
