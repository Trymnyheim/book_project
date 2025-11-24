require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://library_admin:test123@localhost:5432/libary';

const pool = new Pool({ connectionString });

async function main(){
  try {
    const t = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;`
    );

    if (t.rows.length === 0) {
      console.log('No public tables found.');
      return;
    }

    console.log('Public tables:');
    for (const row of t.rows) {
      const table = row.table_name;
      console.log('\n- ' + table);
      try {
        const sample = await pool.query(`SELECT * FROM "${table}" LIMIT 1;`);
        if (sample.rows.length === 0) {
          console.log('  (no rows)');
        } else {
          console.log('  sample row:', sample.rows[0]);
        }
      } catch (err) {
        console.log('  (could not read sample row)', err.message);
      }
    }
  } catch (err) {
    console.error('Error inspecting database:', err.message);
  } finally {
    await pool.end();
  }
}

main();
