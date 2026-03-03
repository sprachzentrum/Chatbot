const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('../config');

const dbDir = path.dirname(config.dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(config.dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initialize() {
  db.exec(`
    -- Kurse des Sprachzentrums
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      language TEXT NOT NULL,
      level TEXT NOT NULL,
      description TEXT,
      schedule TEXT,
      price REAL,
      max_participants INTEGER DEFAULT 15,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- FAQ / Automatische Antworten
    CREATE TABLE IF NOT EXISTS faq (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT DEFAULT 'Allgemein',
      active INTEGER DEFAULT 1,
      usage_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Kontakte (WhatsApp-Nutzer)
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      name TEXT,
      language_pref TEXT DEFAULT 'de',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      last_message_at TEXT
    );

    -- Nachrichten-Verlauf
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_phone TEXT NOT NULL,
      direction TEXT NOT NULL CHECK(direction IN ('in', 'out')),
      body TEXT NOT NULL,
      type TEXT DEFAULT 'text',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (contact_phone) REFERENCES contacts(phone)
    );

    -- Kurs-Anmeldungen
    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_phone TEXT NOT NULL,
      course_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (contact_phone) REFERENCES contacts(phone),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );

    -- Admin-Benutzer
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Bot-Einstellungen
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Standard-FAQs einfügen, falls leer
  const faqCount = db.prepare('SELECT COUNT(*) as count FROM faq').get();
  if (faqCount.count === 0) {
    const insertFaq = db.prepare(
      'INSERT INTO faq (keyword, question, answer, category) VALUES (?, ?, ?, ?)'
    );
    const defaultFaqs = [
      ['kurse', 'Welche Kurse bietet ihr an?', 'Wir bieten Kurse in Deutsch, Englisch, Französisch, Spanisch und Italienisch an. Stufen von A1 bis C2. Tippe "kursübersicht" für eine vollständige Liste.', 'Kurse'],
      ['preise', 'Was kosten die Kurse?', 'Unsere Kurspreise variieren je nach Sprache und Intensität. Semesterkurse ab 250€, Intensivkurse ab 400€. Kontaktieren Sie uns für ein individuelles Angebot.', 'Preise'],
      ['anmeldung', 'Wie kann ich mich anmelden?', 'Sie können sich direkt hier anmelden! Schreiben Sie "anmelden" gefolgt vom Kursnamen, z.B. "anmelden Deutsch A1". Alternativ besuchen Sie uns vor Ort.', 'Anmeldung'],
      ['zeiten', 'Wann finden die Kurse statt?', 'Unsere Kurse finden montags bis freitags statt. Vormittagskurse: 9-12 Uhr, Nachmittagskurse: 14-17 Uhr, Abendkurse: 18-20:30 Uhr.', 'Zeiten'],
      ['kontakt', 'Wie kann ich euch erreichen?', 'Sie erreichen uns telefonisch, per E-Mail oder persönlich vor Ort. Unsere Öffnungszeiten sind Mo-Fr 8:00-18:00 Uhr.', 'Kontakt'],
      ['einstufung', 'Wie wird mein Sprachniveau eingestuft?', 'Wir bieten kostenlose Einstufungstests an! Schreiben Sie "einstufungstest" und wir senden Ihnen einen Link zum Online-Test.', 'Einstufung'],
      ['standort', 'Wo befindet sich das Sprachzentrum?', 'Unser Sprachzentrum finden Sie in der Innenstadt. Die genaue Adresse und Wegbeschreibung senden wir Ihnen gerne zu.', 'Standort'],
    ];

    const insertMany = db.transaction((faqs) => {
      for (const faq of faqs) {
        insertFaq.run(...faq);
      }
    });
    insertMany(defaultFaqs);
  }

  // Standard-Einstellungen
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get();
  if (settingsCount.count === 0) {
    const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
    insertSetting.run('welcome_message', config.bot.welcomeMessage);
    insertSetting.run('bot_name', config.bot.name);
    insertSetting.run('auto_reply', '1');
    insertSetting.run('business_hours', '08:00-18:00');
    insertSetting.run('out_of_hours_message', 'Vielen Dank für Ihre Nachricht. Unser Büro ist derzeit geschlossen. Wir melden uns schnellstmöglich bei Ihnen.');
  }
}

module.exports = { db, initialize };
