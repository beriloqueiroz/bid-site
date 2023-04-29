/* eslint-disable prefer-destructuring */
import { connection } from '@/lib/db/mysql/factory';
import { Account, AccountInfo, TrackingTaskConfig } from '@/lib/types/AccountInfo';
import { CreateResponse } from '../IAccountInfosService';

async function getTrackingKeysByUserID(userID: string): Promise<TrackingTaskConfig[]> {
  const statment = 'SELECT * FROM `delivery_accont` WHERE `enabled`=true;';
  let conn = null;
  let result = [];
  try {
    conn = await connection();
  } catch (e) {
    return [];
  }
  if (!conn) {
    return [];
  }
  try {
    result = await conn.query(statment, [userID]) as any[][];
  } catch (e) {
    return [];
  }
  const res = result[0];
  conn.end();

  return res.map((row) => ({
    key: row.auth_key,
    name: row.name,
    id: row.id,
  })).reverse() as TrackingTaskConfig[];
}

async function getAccountInfosByUserID(userID: string): Promise<AccountInfo | null> {
  const statment = `select da.*, c.*, cp.* from delivery_accont da 
                    join clients_config cc on cc.account_to_send=da.id 
                    join users u on u.client_id=cc.client_id 
                    join clients c on c.id=u.client_id
                    join clients_price cp on c.id=cp.client_id
                    where u.id=? and da.enabled=true;`;
  let conn = null;
  try {
    conn = await connection();
  } catch (e) {
    return null;
  }
  if (!conn) {
    return null;
  }
  const result = await conn.query(statment, [userID]) as any[][];
  const res = result[0][0];
  conn.end();
  if (!result[0][0]) return null;

  return {
    key: res.auth_key,
    driver: res.driver,
    team: res.team,
    model: res.model,
    rule: res.rule,
    client: {
      prefix: res.prefix,
      address: res.address,
      allowInlote: res.allow_inlote,
      corporateName: res.corporate_name,
      name: res.name,
      prices: {
        gain: res.gain,
        capital: {
          d: res.d_capital as number,
          d1: res.d1_capital as number,
        },
        metropolitana: {
          d: res.d_metropolitana as number,
          d1: res.d1_metropolitana as number,
        },
      },
    },
  };
}
async function getAccountInfoByAccountID(accountId :string): Promise<Account | null> {
  const statment = 'select da.* from delivery_accont da where da.id=? and da.enabled=true;';
  let conn = null;
  let res = null;
  try {
    conn = await connection();
  } catch (e) {
    return null;
  }
  if (!conn) {
    return null;
  }
  try {
    const result = await conn.query(statment, [accountId]) as any[][];
    res = result[0][0];
    conn.end();
  } catch (e) {
    return null;
  }

  if (!res) return null;

  return {
    key: res.auth_key,
    driver: res.driver,
    team: res.team,
    model: res.model,
    rule: res.rule,
  };
}

async function listAccountInfos(): Promise<AccountInfo[]> {
  const statment = `select da.*, c.*, cp.* from delivery_accont da 
                    join clients_config cc on cc.account_to_send=da.id 
                    join users u on u.client_id=cc.client_id 
                    join clients c on c.id=u.client_id
                    join clients_price cp on c.id=cp.client_id
                    where da.enabled=true;`;
  let conn = null;
  try {
    conn = await connection();
  } catch (e) {
    return [];
  }
  if (!conn) {
    return [];
  }
  const result = await conn.query(statment, []) as any[][];
  const response = result[0];
  conn.end();
  if (!result[0]) return [];

  return response.map((res) => (
    {
      key: res.auth_key,
      driver: res.driver,
      team: res.team,
      model: res.model,
      rule: res.rule,
      client: {
        prefix: res.prefix,
        address: res.address,
        allowInlote: res.allow_inlote,
        corporateName: res.corporate_name,
        name: res.name,
        prices: {
          gain: res.gain,
          capital: {
            d: res.d_capital as number,
            d1: res.d1_capital as number,
          },
          metropolitana: {
            d: res.d_metropolitana as number,
            d1: res.d1_metropolitana as number,
          },
        },
      },
    }));
}

// verifica se já não existe o prefixo no clients
// verifica se já não existe o username no users
//  client_id no prices
// se passar insere nas tabelas acima
async function createAccountInfo(info:AccountInfo):Promise<CreateResponse | null> {
  const statmentSelClientByPrefix = 'SELECT id FROM `clients` WHERE `prefix` = ?';
  const statmentSelUserByUsername = 'SELECT id FROM `users` WHERE `username` = ?';
  let conn = null;
  try {
    conn = await connection();
  } catch (e) {
    return null;
  }
  if (!conn) {
    return null;
  }
  const checkPrefix = await conn.query(statmentSelClientByPrefix, [info.client.prefix]) as any[][];

  if (checkPrefix[0][0]) {
    return null;
  }

  const checkUser = await conn.query(statmentSelUserByUsername, [`${info.client.prefix}1`]) as any[][];

  if (checkUser[0][0]) {
    return null;
  }

  const statmentCreateClient = 'INSERT INTO `clients`(`corporate_name`, `prefix`, `address`, `name`, `allow_inlote`) VALUES (?,?,?,?,?)';
  const statmentCreateClientConfig = 'INSERT INTO `clients_config`(`client_id`, `account_to_send`) VALUES (?,?)';
  const statmentCreateClientPrice = 'INSERT INTO `clients_price`(`client_id`, `d1_capital`, `d1_metropolitana`, `d_capital`,'
  + ' `d_metropolitana`, `devolucao`, `reversa`, `gain`) VALUES (?,?,?,?,?,?,?,?)';
  const statmentCreateUser = 'INSERT INTO `users`(`username`, `password`, `client_id`) VALUES (?,?,?)';

  try {
    await conn.beginTransaction();
    const result1: any = await conn.query(
      statmentCreateClient,
      [info.client.corporateName, info.client.prefix, info.client.address, info.client.name, 1],
    );
    const resultId = result1[0].insertId;
    await conn.query(statmentCreateClientConfig, [resultId, 1]);
    await conn.query(
      statmentCreateClientPrice,
      [resultId, info.client.prices.capital.d1, info.client.prices.metropolitana.d1,
        info.client.prices.capital.d, info.client.prices.metropolitana.d, 0, 0, info.client.prices.gain],
    );
    await conn.query(statmentCreateUser, [`${info.client.prefix}1`, `${info.client.prefix}123`, resultId]);
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    conn.end();
    throw new Error(`Erro ao salvar${error}`);
  }
  return {
    ok: true,
    user: `${info.client.prefix}1`,
    pass: `${info.client.prefix}123`,
  };
}
export const accountInfosSQL = {
  listAccountInfos, getAccountInfoByAccountID, getAccountInfosByUserID, getTrackingKeysByUserID, createAccountInfo,
};
