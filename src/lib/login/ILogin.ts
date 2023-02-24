import { loginImplementation } from './implementations/enviroment';

export type authResponse = {
  token: string | null
  isAdmin?: boolean
}

interface ILoginService {
  login(user: string, password: string): Promise<authResponse>;
  logout(user: string, token: string): Promise<void>;
  authenticate(user: string, password: string, token: string): Promise<authResponse>;
}

export const loginService: ILoginService = loginImplementation;
