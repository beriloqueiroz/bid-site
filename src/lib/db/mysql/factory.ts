import { createConnection } from 'mysql2/promise';

export async function connection() {
  return createConnection({
    host: 'sql567.main-hosting.eu',
    database: 'u869641756_bid_db',
    user: 'u869641756_bid_user',
    password: 'Mysql@bid#123',
  });
}
