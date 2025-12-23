import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

interface Database {
  query<T extends QueryResultRow = any>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>>;
  getClient(): Promise<PoolClient>;
  end(): Promise<void>;
}

// Create connection pool with increased timeouts for Neon serverless
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000, // 30 seconds idle timeout
  connectionTimeoutMillis: 30000, // 30 seconds connection timeout (increased from 10s)
  query_timeout: 60000, // 60 seconds query timeout
  statement_timeout: 60000, // 60 seconds statement timeout
  keepAlive: true, // Keep connections alive
  keepAliveInitialDelayMillis: 10000, // Initial delay for keep-alive
});

// Helper function to generate CUID-like IDs
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}${randomPart}`;
}

// Database wrapper with helper methods
const db: Database & {
  generateId: () => string;
  transaction: <T>(callback: (client: PoolClient) => Promise<T>) => Promise<T>;
} = {
  query: async <T extends QueryResultRow = any>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>> => {
    const start = Date.now();
    try {
      const res = await pool.query<T>(text, params);
      const duration = Date.now() - start;
      if (process.env.NODE_ENV === 'development') {
        console.log('[DB Query]', { text, duration, rows: res.rowCount });
      }
      return res;
    } catch (error) {
      console.error('[DB Error]', { text, params, error });
      throw error;
    }
  },

  getClient: async (): Promise<PoolClient> => {
    return await pool.connect();
  },

  end: async (): Promise<void> => {
    await pool.end();
  },

  generateId: (): string => {
    return generateId();
  },

  transaction: async <T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
};

// Test connection on startup (avoid noisy failures when DATABASE_URL is not set, or in test env)
if (process.env.DATABASE_URL && process.env.NODE_ENV !== 'test') {
  pool.connect()
    .then(client => {
      console.log('[DB] PostgreSQL connection established');
      client.release();
    })
    .catch(error => {
      console.error('[DB] PostgreSQL connection failed:', error);
    });
}

// Handle pool errors
pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err);
});

export default db;

