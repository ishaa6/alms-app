const getPool = require('../config/db'); // Adjust path if needed

async function logError({ userId, companyId, endpoint, error }) {
  const pool = getPool();
  try {
    await pool.query(
      `INSERT INTO error_logs (user_id, company_id, endpoint, error_message, stack_trace)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        userId || null,
        companyId || null,
        endpoint,
        error.message || 'Unknown error',
        error.stack || null
      ]
    );
  } catch (logErr) {
    console.error('❌ Failed to log error:', logErr);
  }
}

module.exports = logError;
