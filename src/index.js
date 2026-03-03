const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const { initialize } = require('./database/setup');
const { createClient } = require('./whatsapp/client');
const { setupMessageHandler } = require('./whatsapp/handler');
const { ensureAdminExists, requireAuth } = require('./admin/auth');
const adminRoutes = require('./admin/routes');

async function start() {
  console.log('=== Sprachzentrum WhatsApp Chatbot ===');

  // Datenbank initialisieren
  console.log('[DB] Initialisiere Datenbank...');
  initialize();

  // Admin-Benutzer erstellen
  await ensureAdminExists();

  // Express-Server
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  }));

  // Login-Seite ist öffentlich
  app.use('/login.html', express.static(path.join(__dirname, 'public', 'login.html')));
  app.use('/css', express.static(path.join(__dirname, 'public', 'css')));

  // Admin-Routen (enthält eigene Auth-Prüfung für /api/login)
  app.use(adminRoutes);

  // Geschützter Bereich
  app.use(requireAuth);
  app.use(express.static(path.join(__dirname, 'public')));

  app.listen(config.port, () => {
    console.log(`[Server] Admin-Panel läuft auf http://localhost:${config.port}`);
  });

  // WhatsApp-Client starten
  console.log('[WhatsApp] Starte Client...');
  const client = createClient();
  setupMessageHandler(client);

  try {
    await client.initialize();
  } catch (err) {
    console.error('[WhatsApp] Fehler beim Starten:', err.message);
    console.log('[WhatsApp] Der Server läuft weiter. WhatsApp kann später erneut verbunden werden.');
  }
}

start().catch(err => {
  console.error('Fataler Fehler:', err);
  process.exit(1);
});
