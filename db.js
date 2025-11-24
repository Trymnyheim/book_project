const { Pool } = require('pg');   

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:chebly@localhost:5432/libary';

const pool = new Pool({
  connectionString,
});

pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL database successfully.');
    client.release();
  })
  .catch(err => {
    console.error('❌ Error connecting to the PostgreSQL database:', err.stack);
  });
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
