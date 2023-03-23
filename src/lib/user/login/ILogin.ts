/* eslint-disable import/no-cycle */

import { myLoginSQL } from './implementations/myLoginSQL';

export type authResponse = {
  token: string | null
  isAdmin?: boolean,
  id?:number,
  userName?: string
};

interface ILoginService {
  login(user: string, password: string): Promise<authResponse>;
  logout(user: string, token: string): Promise<void>;
  authenticate(user: string, token: string): Promise<authResponse>;
}

export const loginService: ILoginService = myLoginSQL;
