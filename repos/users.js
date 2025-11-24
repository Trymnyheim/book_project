const db = require('../db');

//Function that returns the rental history 
async function rentalHistory(user_id) {
  const r = await db.query(
    `SELECT r.*, b.title, b.author FROM rentals r JOIN books b ON b.id = r.book_id WHERE r.user_id=$1 ORDER BY r.rented_at DESC`,
    [user_id]
  );
  return r.rows;
}

//Function that returns a count of how many subscribers exist in the database
async function countSubscribers() {
  const r = await db.query('SELECT COUNT(*)::int AS c FROM users WHERE subscribed = true');
  return r.rows[0].c;
}

module.exports = { rentalHistory, countSubscribers };
