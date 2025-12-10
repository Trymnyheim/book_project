const db = require('../db');

async function createUser({ name, email, password_hash, subscribed = false }) {
  const r = await db.query(
    `INSERT INTO users (name, email, password_hash, subscribed) VALUES ($1,$2,$3,$4) RETURNING id, name, email, subscribed, created_at`,
    [name || null, email, password_hash, subscribed]
  );
  return r.rows[0];
}

async function getByEmail(email) {
  const r = await db.query('SELECT * FROM users WHERE email=$1', [email]);
  return r.rows[0];
}

async function getById(id) {
  const r = await db.query('SELECT id, name, email, subscribed, created_at FROM users WHERE id=$1', [id]);
  return r.rows[0];
}

async function rentalHistory(user_id) {
  const r = await db.query(
    `SELECT r.*, b.title, b.author FROM rentals r JOIN books b ON b.id = r.book_id WHERE r.user_id=$1 ORDER BY r.rented_at DESC`,
    [user_id]
  );
  return r.rows;
}

async function countSubscribers() {
  const r = await db.query('SELECT COUNT(*)::int AS c FROM users WHERE subscribed = true');
  return r.rows[0].c;
}

module.exports = { createUser, getByEmail, getById, rentalHistory, countSubscribers };
