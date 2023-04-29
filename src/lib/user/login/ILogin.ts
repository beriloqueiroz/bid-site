/* eslint-disable import/no-cycle */

import { authResponse } from '@/lib/types/AuthResponse';
import { myLoginSQL } from './implementations/myLoginSQL';

interface ILoginService {
  login(user: string, password: string): Promise<authResponse>;
  logout(user: string, token: string): Promise<void>;
  authenticate(user: string, token: string): Promise<authResponse>;
  edit(user: string, token: string, oldPassword:string, newUser:string, newPassword: string): Promise<authResponse>;
}

export const loginService: ILoginService = myLoginSQL;
