function login(user: string, password: string): Promise<string | null> {
  if (process.env[user] != password) return getNull();
  return getClear();
}

async function getNull() {
  return null;
}

async function getClear() {
  return '12365478';
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

export const loginImplementation = { login, logout };
