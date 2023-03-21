import { connection } from '@/lib/db/mysql/factory';
import { randomUUID } from 'crypto';
import moment, { now } from 'moment';
import { authResponse } from '../ILogin';

async function login(user: string, password: string): Promise<authResponse> {
  const statment = 'SELECT isAdmin, id FROM `users` WHERE `username` = ? AND `password` = ?';
  let conn = null;
  try {
    conn = await connection();
  } catch (e) {
    return { token: null };
  }
  if (!conn) {
    return { token: null };
  }
  const result = await conn.query(statment, [user, password]) as any[][];

  const statmentUpdate = 'UPDATE `users` SET `token`= ? where `id` = ?';

  const tokenRandom = randomUUID();
  const { isAdmin, id } = result[0][0];

  let resultUpdateToken = null;
  try {
    resultUpdateToken = await conn.query(statmentUpdate, [tokenRandom, id]);
  } catch (e) {
    return { token: null };
  }
  conn.end();
  if (!resultUpdateToken) {
    return { token: null };
  }
  return {
    token: tokenRandom,
    isAdmin: !!isAdmin,
    id,
    userName: user,
  };
}

async function authenticate(user: string, currentToken: string): Promise<authResponse> {
  const statment = 'SELECT token, isAdmin, id, token_expired_date, username FROM `users` WHERE `username` = ? AND `token` = ?';
  let conn = null;
  try {
    conn = await connection();
  } catch (e) {
    return { token: null };
  }
  if (!conn) {
    return { token: null };
  }
  const result = await conn.query(statment, [user, currentToken]) as any[][];
  const {
    isAdmin, token, token_expired_date, id,
  } = result[0][0];
  conn.end();
  if (moment(token_expired_date).add(2, 'day').isBefore(now())) {
    return { token: null };
  }
  return {
    token,
    id,
    isAdmin: !!isAdmin,
  };
}

async function logout(user: string, token: string): Promise<void> {
  const statment = 'SELECT id FROM `users` WHERE `username` = ? AND `token` = ?';
  let conn = null;
  try {
    conn = await connection();
  } catch (e) {
    throw new Error('erro ao fazer logoff');
  }
  if (!conn) {
    throw new Error('erro ao fazer logoff');
  }
  const result = await conn.query(statment, [user, token]) as any[][];
  const { id } = result[0][0];
  const statmentUpdate = 'UPDATE `users` SET `token`= ? where `id` = ?';

  let resultUpdateToken = null;
  try {
    resultUpdateToken = await conn.query(statmentUpdate, ['', id]);
  } catch (e) {
    conn.end();
    throw new Error('erro ao fazer logoff');
  }
  conn.end();
  if (!resultUpdateToken) {
    throw new Error('erro ao fazer logoff');
  }
}

export const myLoginSQLImplementation = { login, logout, authenticate };
