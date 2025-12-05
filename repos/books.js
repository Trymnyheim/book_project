const db = require('../db');
const { randomUUID } = require('crypto');

async function list({ title, author, available, limit = 100, offset = 0 }) {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (title) {
    conditions.push(`LOWER(title) LIKE LOWER($${idx++})`);
    params.push(`%${title}%`);
  }
  if (author) {
    conditions.push(`LOWER(author) LIKE LOWER($${idx++})`);
    params.push(`%${author}%`);
  }
  if (available !== undefined) {
    if (available === 'true' || available === true) {
      conditions.push(`available_copies > 0`);
    } else {
      conditions.push(`available_copies = 0`);
    }
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  // Order available books first, then by title to show all the books up-front by default
  const q = `SELECT * FROM books ${where} ORDER BY (available_copies > 0) DESC, title LIMIT $${idx++} OFFSET $${idx++}`;
  params.push(limit, offset);
  const r = await db.query(q, params);
  return r.rows;
}

async function getById(id) {
  const r = await db.query('SELECT * FROM books WHERE id = $1', [id]);
  return r.rows[0];
}

async function create({ title, author, publisher, isbn, total_copies = 1 }) {
  const id = randomUUID();
  const available_copies = total_copies;
  const r = await db.query(
    `INSERT INTO books(id, title, author, publisher, isbn, total_copies, available_copies)
     VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [id, title, author, publisher || null, isbn || null, total_copies, available_copies]
  );
  return r.rows[0];
}

async function update(id, fields) {
  const allowed = ['title', 'author', 'publisher', 'isbn', 'total_copies', 'available_copies'];
  const sets = [];
  const params = [];
  let idx = 1;
  for (const k of allowed) {
    if (fields[k] !== undefined) {
      sets.push(`${k} = $${idx++}`);
      params.push(fields[k]);
    }
  }
  if (!sets.length) return getById(id);
  params.push(id);
  const q = `UPDATE books SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`;
  const r = await db.query(q, params);
  return r.rows[0];
}

async function remove(id) {
  await db.query('DELETE FROM books WHERE id=$1', [id]);
}

async function count() {
  const r = await db.query('SELECT COUNT(*)::int AS c FROM books');
  return r.rows[0].c;
}

module.exports = { list, getById, create, update, remove, count };
