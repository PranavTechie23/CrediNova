/**
 * PostgreSQL Connection Pool
 * Manages database connections with connection pooling for performance
 */

const { Pool } = require('pg');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'credinova',
  
  // Connection pooling configuration
  max: parseInt(process.env.DB_POOL_MAX) || 20, // Max connections
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 5000,
  
  // SSL for secure connections (required for production)
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  } : false,
  
  // Application name for monitoring
  application_name: 'credinova-backend'
});

// Connection error handler
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test connection on startup
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('❌ PostgreSQL Connection Failed:', err.message);
    process.exit(1);
  } else {
    console.log('✅ PostgreSQL Connected:', result.rows[0].now);
  }
});

/**
 * Query helper with prepared statements (prevents SQL injection)
 */
async function query(text, params = []) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.DEBUG_SQL === 'true') {
      console.log('Executed query:', { text, params, duration });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', error, { text, params });
    throw error;
  }
}

/**
 * Transaction helper
 */
async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get pool stats for monitoring
 */
function getPoolStats() {
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount
  };
}

/**
 * Graceful shutdown
 */
async function shutdown() {
  console.log('Shutting down database pool...');
  await pool.end();
  console.log('✅ Database pool closed');
}

module.exports = {
  pool,
  query,
  transaction,
  getPoolStats,
  shutdown
};
