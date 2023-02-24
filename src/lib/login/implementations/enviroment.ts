import { isNumber } from '@/lib/util/rules';
import moment from 'moment';
import { authResponse } from '../ILogin';

async function login(user: string, password: string): Promise<authResponse> {
  console.log("🚀 ~ file: enviroment.ts:6 ~ login ~ user:", user)
  if (process.env[user] != password) return getNull();
  const token = await getToken();
  console.log("🚀 ~ file: enviroment.ts:8 ~ login ~ token:", {
    token,
    isAdmin: process.env['ADMIN_USERS']?.includes(user)
  })
  return {
    token,
    isAdmin: process.env['ADMIN_USERS']?.includes(user)
  }
}

async function authenticate(user: string, password: string, token: string): Promise<authResponse> {
  if (process.env[user] != password) return getNull();
  if (!isNumber(token)) return getNull();
  if (parseInt(token) < moment().valueOf()) return getNull();
  const tokenRes = await getToken();
  return {
    token:tokenRes,
    isAdmin: process.env['ADMIN_USERS']?.includes(user)
  }
}

async function getNull() {
  return {
    token: null
  };
}

async function getToken(): Promise<string> {
  return moment()
    .subtract(parseInt(`${process.env.TZ_DIFERENCE_SUB}`), 'hours')
    .add(1, 'days')
    .valueOf()
    .toString();
}

async function logout(user: string, token: string): Promise<void> {
  if (!process.env[user]) {
    console.log('not implements', token);
  }
  await nope();
}
async function nope() {
  console.log(nope);
}

export const loginImplementation = { login, logout, authenticate };
