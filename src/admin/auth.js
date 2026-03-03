const bcrypt = require('bcrypt');
const { db } = require('../database/setup');
const config = require('../config');

async function ensureAdminExists() {
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(config.admin.user);
  if (!admin) {
    const hash = await bcrypt.hash(config.admin.pass, 10);
    db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(config.admin.user, hash);
    console.log(`[Admin] Admin-Benutzer "${config.admin.user}" wurde erstellt.`);
  }
}

async function authenticate(username, password) {
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin) return false;
  return bcrypt.compare(password, admin.password_hash);
}

function requireAuth(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Nicht autorisiert' });
  }
  res.redirect('/login.html');
}

module.exports = { ensureAdminExists, authenticate, requireAuth };
