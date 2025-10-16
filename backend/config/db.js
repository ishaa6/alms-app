// config/db.js
const { Pool } = require('pg');
const {fetchSecrets} = require('../vault/vault-client');

let pool;

async function initDB() {
  const secrets = await fetchSecrets();

  pool = new Pool({
    connectionString: secrets.DATABASE_URL,
  });

  console.log('✅ PostgreSQL pool initialized.');
}

function getPool() {
  if (!pool) throw new Error('Pool not initialized. Call initDB() first.');
  return pool;
}

module.exports = { initDB, getPool };
