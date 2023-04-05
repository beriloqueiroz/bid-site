/* eslint-disable prefer-destructuring */
import { connection } from '@/lib/db/mysql/factory';
import { Account, AccountInfo, TrackingTaskConfig } from '@/lib/types/AccountInfo';

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
  })) as TrackingTaskConfig[];
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

export const accountInfosSQL = { getAccountInfoByAccountID, getAccountInfosByUserID, getTrackingKeysByUserID };
