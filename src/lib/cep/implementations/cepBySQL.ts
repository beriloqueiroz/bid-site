import { CepInfo } from '@/lib/types/CepInfo';
/* eslint-disable prefer-destructuring */
import { connection } from '@/lib/db/mysql/factory';

async function getCepInfo(cepIn:string): Promise<CepInfo | undefined> {
  const statment = 'SELECT * FROM `ceps_infos` WHERE `cep`=?;';
  let conn = null;
  let result;
  try {
    conn = await connection();
  } catch (e) {
    return undefined;
  }
  if (!conn) {
    return undefined;
  }
  try {
    result = await conn.query(statment, [cepIn]) as any[][];
  } catch (e) {
    conn.end();
    return undefined;
  }
  const {
    street, cep, neighborhood, city, uf,
  } = result[0][0];
  conn.end();

  return {
    rua: street,
    cep,
    bairro: neighborhood,
    cidade: city,
    estado: uf,
  };
}

export const cepBySQL = { getCepInfo };
