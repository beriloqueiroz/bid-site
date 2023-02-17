import { loginImplementation } from './implementations/enviroment';

interface ILoginService {
  login(user: string, password: string): Promise<string | null>;
  logout(user: string, token: string): Promise<void>;
  authenticate(user: string, password: string, token: string): Promise<string | null>;
}

export const loginService: ILoginService = loginImplementation;
