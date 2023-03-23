import { PriceConfig } from './PriceConfig';

export interface Client {
  prefix: string;
  corporateName: string;
  address:string;
  name: string;
  allowInlote: boolean;
  prices: PriceConfig
}
