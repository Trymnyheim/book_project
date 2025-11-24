const db = require('../db');
const { randomUUID } = require('crypto');

async function create({ book_id, user_id, due_date }) {
  // check availability
  const book = (await db.query('SELECT available_copies FROM books WHERE id=$1', [book_id])).rows[0];
  if (!book) throw new Error('book_not_found');
  if (book.available_copies < 1) throw new Error('not_available');

  const id = randomUUID();
  const rented_at = new Date();
  const status = 'rented';

  // transaction
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO rentals(id, book_id, user_id, rented_at, due_date, status) VALUES($1,$2,$3,$4,$5,$6)`,
      [id, book_id, user_id, rented_at, due_date || null, status]
    );
    await client.query('UPDATE books SET available_copies = available_copies - 1 WHERE id=$1', [book_id]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  const r = await db.query('SELECT * FROM rentals WHERE id=$1', [id]);
  return r.rows[0];
}

async function returnRental(id) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const r = await client.query('SELECT * FROM rentals WHERE id=$1 FOR UPDATE', [id]);
    if (r.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }
    const rental = r.rows[0];
    if (rental.returned_at) {
      await client.query('ROLLBACK');
      return rental; // already returned
    }
    const returned_at = new Date();
    await client.query('UPDATE rentals SET returned_at=$1, status=$2 WHERE id=$3', [returned_at, 'returned', id]);
    await client.query('UPDATE books SET available_copies = available_copies + 1 WHERE id=$1', [rental.book_id]);
    await client.query('COMMIT');
    const updated = (await db.query('SELECT * FROM rentals WHERE id=$1', [id])).rows[0];
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function countActive() {
  const r = await db.query("SELECT COUNT(*)::int AS c FROM rentals WHERE status='rented'");
  return r.rows[0].c;
}

module.exports = { create, returnRental, countActive };
