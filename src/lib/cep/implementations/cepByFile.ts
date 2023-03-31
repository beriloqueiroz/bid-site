import { ceps } from '@/lib/helpers/ceps';
import { CepInfo } from '@/lib/types/CepInfo';

function getCepInfo(cep:string): Promise<CepInfo | undefined> | CepInfo | undefined {
  const infos = ceps.find((elem) => elem.cep === cep);
  return infos;
}

export const cepByFile = { getCepInfo };
