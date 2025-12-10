# Book Project

This project is done in the class Information Systems Design at ECE Paris.
This is a minimal demo server and UI that connects to an existing PostgreSQL database named `libary` (user-provided DB). It demonstrates basic library features: listing/searching books, renting/returning books, and viewing user history.

## Quick start

1. Make sure server/.env contains database credentials

2. Install dependencies:

```powershell
npm install
```

If you just pulled new changes for authentication, install the new auth packages as well:

```powershell
npm install bcryptjs jsonwebtoken
```

3. Start the server:

```powershell
npm start
```

Server listens on port 3000 and binds to all interfaces (0.0.0.0).

4. Open the demo UI in a browser:

http://127.0.0.1:3000/

or

http://localhost:3000/

## API (examples)

- List books: GET /api/books
- Search by title/author: GET /api/books?title=Clean&author=Martin
- Create rental: POST /api/rentals { book_id, user_id, due_date }

Note: Students can now sign up and log in. Use the `Student Portal` UI at `/student.html`.

- Create rental: POST /api/rentals { book_id, user_id, due_date }
- Return rental: POST /api/rentals/:id/return
- User history: GET /api/users/:id/history
- Stats: GET /api/stats

## Notes
- The code uses parameterized queries to prevent SQL injection.
- Books are ordered with available copies first so users see borrowable items up-front.
- No authentication is implemented in this demo; add a token or session layer for production.

Authentication:
- Student signup: POST `/api/auth/signup` { name, email, password } → returns `{ token, user }`
- Student login: POST `/api/auth/login` { email, password } → returns `{ token, user }`

When logged in the client should send `Authorization: Bearer <token>` header. The `Student Portal` at `/student.html` stores the token in `localStorage` and uses it when renting books.

Database setup (users table):

Run this SQL on your PostgreSQL database to create the `users` table (uses `pgcrypto` for server-side UUID; alternatively generate UUIDs in the app):

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name TEXT,
	email TEXT UNIQUE NOT NULL,
	password_hash TEXT NOT NULL,
	subscribed BOOLEAN DEFAULT false,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

Add to your `.env` a JWT secret for production use:

```
JWT_SECRET=your_production_secret_here
```

If you want, I can:
- Add a simple admin token guard for write operations.
- Create a small script that seeds the database for local development (only if you allow creating objects).
- Add unit/integration tests for the API.