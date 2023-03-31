import { CepInfo } from '../types/CepInfo';
import { cepBySQL } from './implementations/cepBySQL';

export interface ICepsInfoService {
  getCepInfo(cep:string): Promise<CepInfo | undefined> | CepInfo | undefined;
}

export const cepService: ICepsInfoService = cepBySQL;
