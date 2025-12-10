const jwt = require('jsonwebtoken');
const usersRepo = require('../repos/users');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

async function optionalAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return next();
  const token = h.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await usersRepo.getById(payload.id);
    if (user) req.user = { id: user.id, email: user.email, name: user.name };
  } catch (err) {
    // ignore invalid token, proceed without user
  }
  next();
}

function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ error: 'unauthorized' });
  const token = h.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, email: payload.email };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'unauthorized' });
  }
}

module.exports = { optionalAuth, requireAuth };
