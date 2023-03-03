import { isNumber } from '@/lib/util/rules';
import moment from 'moment';
import { authResponse } from '../ILogin';

async function login(user: string, password: string): Promise<authResponse> {
  if (process.env[user] != password) return getNull();
  const token = await getToken();

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
    token: tokenRes,
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
    .subtract(3, 'hours')
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
