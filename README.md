# Book Project

This is a minimal demo server and UI that connects to an existing PostgreSQL database named `libary` (user-provided DB). It demonstrates basic library features: listing/searching books, renting/returning books, and viewing user history.

## Quick start

1. Open a PowerShell terminal in the `server` folder:

```powershell
cd "c:/Users/chebl/Documents/Ece/Semster1/information systems/server"
```

2. Make sure server/.env contains database credentials

3. Install dependencies:

```powershell
npm install
```

4. Start the server:

```powershell
npm start
```

Server listens on port 3000 and binds to all interfaces (0.0.0.0).

5. Open the demo UI in a browser:

http://127.0.0.1:3000/

or

http://localhost:3000/

## API (examples)

- List books: GET /api/books
- Search by title/author: GET /api/books?title=Clean&author=Martin
- Create rental: POST /api/rentals { book_id, user_id, due_date }
- Return rental: POST /api/rentals/:id/return
- User history: GET /api/users/:id/history
- Stats: GET /api/stats

## Notes
- The code uses parameterized queries to prevent SQL injection.
- Books are ordered with available copies first so users see borrowable items up-front.
- No authentication is implemented in this demo; add a token or session layer for production.

If you want, I can:
- Add a simple admin token guard for write operations.
- Create a small script that seeds the database for local development (only if you allow creating objects).
- Add unit/integration tests for the API.