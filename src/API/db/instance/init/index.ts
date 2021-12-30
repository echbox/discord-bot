import { Pool, QueryResult } from 'pg';
import { Logger } from 'src/API/logger';
import { queries } from '../queries';

interface DbConfig {
  isProduction: boolean;
  databaseUrl?: string;
  user?: string;
  password?: string;
  host?: string;
  port?: string;
  database?: string;
}

const makeConnectionString = ({
  isProduction,
  databaseUrl,
  user,
  password,
  host,
  port,
  database,
}: DbConfig): string => {
  if (isProduction) {
    if (!databaseUrl) throw new Error('Database config: No database url in production');
    return databaseUrl;
  }
  if (!user) throw new Error('Database config: No user in development');
  if (!password) throw new Error('Database config: No password in development');
  if (!host) throw new Error('Database config: No host in development');
  if (!port) throw new Error('Database config: No port in development');
  if (!database) throw new Error('Database config: No database in development');

  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
};

const connectDb = async (logger: Logger, config: DbConfig): Promise<Pool> => {
  const connectionString = makeConnectionString(config);

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  logger.debug(config, 'Db instance created with config');

  return pool;
};

interface UserCount {
  users_count: string;
  applied_users_count: string;
}

const allUsers = `SELECT (${queries.countUsers}) AS users_count, (${queries.countAppliedUsers}) AS applied_users_count`;

const countUsers = async (pool: Pool) => {
  const res: QueryResult<UserCount> = await pool.query(allUsers);
  return [Number(res.rows[0].users_count), Number(res.rows[0].applied_users_count)];
};

const initTables = async (pool: Pool, logger: Logger) => {
  await pool.query(`${queries.usersTable}; ${queries.appliedUsersTable}`);

  const [count, appliedCount] = await countUsers(pool);
  logger.debug(`Users table count: ${count}; Applied users table count: ${appliedCount}`);
};

export type { DbConfig };
export { initTables, connectDb };
