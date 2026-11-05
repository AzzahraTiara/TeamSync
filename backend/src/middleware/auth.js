const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Belum login' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, role, nama }
    next();
  } catch {
    res.status(401).json({ error: 'Token tidak valid atau kedaluwarsa' });
  }
}

const onlyRole = (role) => (req, res, next) =>
  req.user.role === role ? next() : res.status(403).json({ error: `Hanya untuk ${role}` });

module.exports = { authRequired, onlyRole };