import { loginImplementation } from "./implementations/enviroment";

interface ILoginService {
    login(user: string, password: string): Promise<String | null>;
    logout(user: string, token: string): Promise<void>;
}

export const loginService: ILoginService = loginImplementation;