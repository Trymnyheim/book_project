require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const db = require('./db');

const booksRepo = require('./repos/books');
const rentalsRepo = require('./repos/rentals');
const usersRepo = require('./repos/users');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static UI
app.use(express.static(path.join(__dirname, 'public')));

// API prefix
const api = express.Router();

// List books with optional filters
api.get('/books', async (req, res) => {
  try {
    const { title, author, available, limit, offset } = req.query;
    const rows = await booksRepo.list({ title, author, available, limit, offset });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

api.get('/books/:id', async (req, res) => {
  try {
    const book = await booksRepo.getById(req.params.id);
    if (!book) return res.status(404).json({ error: 'not_found' });
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Add a new book 
api.post('/books', async (req, res) => {
  try {
    const { title, author, publisher, isbn, total_copies } = req.body;
    if (!title || !author) return res.status(400).json({ error: 'missing_fields' });
    const book = await booksRepo.create({ title, author, publisher, isbn, total_copies: total_copies || 1 });
    res.status(201).json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Update a book
api.put('/books/:id', async (req, res) => {
  try {
    const updated = await booksRepo.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'not_found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Delete a book
api.delete('/books/:id', async (req, res) => {
  try {
    await booksRepo.remove(req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Create rental
api.post('/rentals', async (req, res) => {
  try {
    const { book_id, user_id, due_date } = req.body;
    if (!book_id || !user_id) return res.status(400).json({ error: 'missing_fields' });
    const rental = await rentalsRepo.create({ book_id, user_id, due_date });
    res.status(201).json(rental);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Return rental
api.post('/rentals/:id/return', async (req, res) => {
  try {
    const rental = await rentalsRepo.returnRental(req.params.id);
    if (!rental) return res.status(404).json({ error: 'not_found' });
    res.json(rental);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// User history
api.get('/users/:id/history', async (req, res) => {
  try {
    const history = await usersRepo.rentalHistory(req.params.id);
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Simple stats
api.get('/stats', async (req, res) => {
  try {
    const totalBooks = await booksRepo.count();
    const lent = await rentalsRepo.countActive();
    const subscribers = await usersRepo.countSubscribers();
    res.json({ totalBooks, lent, subscribers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
});

app.use('/api', api);

const port = process.env.PORT || 3000;
// listen on all interfaces so both localhost and 127.0.0.1 work reliably on all platforms
app.listen(port, '0.0.0.0', () => console.log(`Server listening on port ${port}`));
