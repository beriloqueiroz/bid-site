import { connection } from '@/lib/db/mysql/factory';
import { SendTaskConfig, TrackingTaskConfig } from '@/lib/types/TaskConfig';

async function getTrackingKeysByUserID(userID: string): Promise<TrackingTaskConfig[]> {
  const statment = 'SELECT * FROM `delivery_accont` WHERE `enabled`=true;';
  let conn = null;
  try {
    conn = await connection();
  } catch (e) {
    return [];
  }
  if (!conn) {
    return [];
  }
  const result = await conn.query(statment, [userID]) as any[][];
  const res = result[0];
  conn.end();

  return res.map((row) => ({
    key: row.auth_key,
    name: row.name,
    id: row.id,
  })) as TrackingTaskConfig[];
}

async function getSendInfosByUserID(userID: string): Promise<SendTaskConfig | null> {
  const statment = `select da.*, c.* from delivery_accont da 
                    join clients_config cc on cc.account_to_send=da.id 
                    join users u on u.client_id=cc.client_id 
                    join clients c on c.id=u.client_id
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
    prefix: res.prefix,
    address: res.address,
  };
}
async function getSendInfoByAccountID(accountId :string): Promise<SendTaskConfig | null> {
  const statment = `select da.*, c.* from delivery_accont da 
                    join clients_config cc on cc.account_to_send=da.id 
                    join users u on u.client_id=cc.client_id 
                    join clients c on c.id=u.client_id
                    where da.id=? and da.enabled=true;`;
  let conn = null;
  try {
    conn = await connection();
  } catch (e) {
    return null;
  }
  if (!conn) {
    return null;
  }
  const result = await conn.query(statment, [accountId]) as any[][];
  const res = result[0][0];
  conn.end();

  if (!result[0][0]) return null;

  return {
    key: res.auth_key,
    driver: res.driver,
    team: res.team,
    model: res.model,
    rule: res.rule,
    prefix: res.prefix,
    address: res.address,
  };
}

export const myAccountSQLImplementation = { getTrackingKeysByUserID, getSendInfosByUserID, getSendInfoByAccountID };
