import { isNumber } from '@/lib/util/rules';
import moment from 'moment';

function login(user: string, password: string): Promise<string | null> {
  if (process.env[user] != password) return getNull();
  return getToken();
}

function authenticate(user: string, password: string, token: string): Promise<string | null> {
  if (process.env[user] != password) return getNull();
  if (!isNumber(token)) return getNull();
  if (parseInt(token) < moment().valueOf()) return getNull();
  console.log('🚀 ~ file: enviroment.ts:15 ~ authenticate ~ parseInt(token)', parseInt(token), moment().valueOf());
  return getToken();
}

async function getNull() {
  return null;
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
