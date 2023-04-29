import { connection } from '@/lib/db/mysql/factory';
import { authResponse } from '@/lib/types/AuthResponse';
import { randomUUID } from 'crypto';
import moment, { now } from 'moment';

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

  if (!result[0][0]) {
    conn.end();
    return {
      token: null,
    };
  }
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

  if (!result[0][0]) {
    conn.end();
    return {
      token: null,
    };
  }

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

async function usernameExist(user:string):Promise<boolean> {
  const statment = 'SELECT id FROM `users` WHERE `username` = ?';
  let conn = null;
  let result = null;
  try {
    conn = await connection();
    result = await conn.query(statment, [user]) as any[][];
    conn.end();
  } catch (e) {
    throw new Error('erro ao fazer consultar usuario');
  }
  console.log('🚀 ~ file: myLoginSQL.ts:124 ~ usernameExist ~ result[0][0]:', result[0][0]);
  return !!result[0][0];
}

async function edit(user: string, currentToken: string, oldPassword:string, newUser:string, newPassword: string): Promise<authResponse> {
  const statment = 'SELECT isAdmin, id FROM `users` WHERE `username` = ? AND `password` = ? and `token` = ?';
  let conn = null;
  try {
    conn = await connection();
  } catch (e) {
    return { token: null };
  }
  if (!conn) {
    return { token: null };
  }

  const newUserExist = await usernameExist(newUser);
  if (newUserExist) {
    return { token: null };
  }

  const result = await conn.query(statment, [user, oldPassword, currentToken]) as any[][];

  const statmentUpdate = 'UPDATE `users` SET `username`= ?, `password`= ?, `token` = ? where `id` = ?';

  const tokenRandom = randomUUID();

  if (!result[0][0]) {
    conn.end();
    return {
      token: null,
    };
  }
  const { isAdmin, id } = result[0][0];

  let resultUpdateToken = null;
  try {
    resultUpdateToken = await conn.query(statmentUpdate, [newUser, newPassword, tokenRandom, id]);
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

export const myLoginSQL = {
  login, logout, authenticate, edit,
};
