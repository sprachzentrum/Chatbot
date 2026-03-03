const { db } = require('./setup');

const queries = {
  // === Kontakte ===
  getOrCreateContact(phone, name) {
    const existing = db.prepare('SELECT * FROM contacts WHERE phone = ?').get(phone);
    if (existing) {
      db.prepare('UPDATE contacts SET last_message_at = datetime("now") WHERE phone = ?').run(phone);
      return existing;
    }
    db.prepare('INSERT INTO contacts (phone, name, last_message_at) VALUES (?, ?, datetime("now"))').run(phone, name);
    return db.prepare('SELECT * FROM contacts WHERE phone = ?').get(phone);
  },

  getAllContacts() {
    return db.prepare('SELECT *, (SELECT COUNT(*) FROM messages WHERE contact_phone = contacts.phone) as message_count FROM contacts ORDER BY last_message_at DESC').all();
  },

  updateContact(phone, data) {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
      if (['name', 'language_pref', 'notes'].includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    if (fields.length === 0) return;
    values.push(phone);
    db.prepare(`UPDATE contacts SET ${fields.join(', ')} WHERE phone = ?`).run(...values);
  },

  // === Nachrichten ===
  saveMessage(contactPhone, direction, body, type = 'text') {
    db.prepare('INSERT INTO messages (contact_phone, direction, body, type) VALUES (?, ?, ?, ?)').run(contactPhone, direction, body, type);
  },

  getMessages(contactPhone, limit = 50) {
    return db.prepare('SELECT * FROM messages WHERE contact_phone = ? ORDER BY created_at DESC LIMIT ?').all(contactPhone, limit).reverse();
  },

  getRecentMessages(limit = 100) {
    return db.prepare(`
      SELECT m.*, c.name as contact_name
      FROM messages m
      LEFT JOIN contacts c ON m.contact_phone = c.phone
      ORDER BY m.created_at DESC LIMIT ?
    `).all(limit);
  },

  // === FAQ ===
  getAllFaqs() {
    return db.prepare('SELECT * FROM faq ORDER BY category, keyword').all();
  },

  getActiveFaqs() {
    return db.prepare('SELECT * FROM faq WHERE active = 1').all();
  },

  findFaqByKeyword(text) {
    const normalized = text.toLowerCase().trim();
    const faqs = db.prepare('SELECT * FROM faq WHERE active = 1').all();
    for (const faq of faqs) {
      const keywords = faq.keyword.toLowerCase().split(',').map(k => k.trim());
      for (const keyword of keywords) {
        if (normalized.includes(keyword)) {
          db.prepare('UPDATE faq SET usage_count = usage_count + 1 WHERE id = ?').run(faq.id);
          return faq;
        }
      }
    }
    return null;
  },

  createFaq(data) {
    return db.prepare('INSERT INTO faq (keyword, question, answer, category) VALUES (?, ?, ?, ?)').run(data.keyword, data.question, data.answer, data.category || 'Allgemein');
  },

  updateFaq(id, data) {
    return db.prepare('UPDATE faq SET keyword = ?, question = ?, answer = ?, category = ?, active = ? WHERE id = ?').run(data.keyword, data.question, data.answer, data.category, data.active ? 1 : 0, id);
  },

  deleteFaq(id) {
    return db.prepare('DELETE FROM faq WHERE id = ?').run(id);
  },

  // === Kurse ===
  getAllCourses() {
    return db.prepare('SELECT *, (SELECT COUNT(*) FROM enrollments WHERE course_id = courses.id AND status != "cancelled") as enrolled FROM courses ORDER BY language, level').all();
  },

  getActiveCourses() {
    return db.prepare('SELECT * FROM courses WHERE active = 1 ORDER BY language, level').all();
  },

  createCourse(data) {
    return db.prepare('INSERT INTO courses (name, language, level, description, schedule, price, max_participants) VALUES (?, ?, ?, ?, ?, ?, ?)').run(data.name, data.language, data.level, data.description, data.schedule, data.price, data.max_participants || 15);
  },

  updateCourse(id, data) {
    return db.prepare('UPDATE courses SET name = ?, language = ?, level = ?, description = ?, schedule = ?, price = ?, max_participants = ?, active = ? WHERE id = ?').run(data.name, data.language, data.level, data.description, data.schedule, data.price, data.max_participants, data.active ? 1 : 0, id);
  },

  deleteCourse(id) {
    return db.prepare('DELETE FROM courses WHERE id = ?').run(id);
  },

  // === Anmeldungen ===
  createEnrollment(contactPhone, courseId) {
    const existing = db.prepare('SELECT * FROM enrollments WHERE contact_phone = ? AND course_id = ? AND status != "cancelled"').get(contactPhone, courseId);
    if (existing) return { duplicate: true };
    return db.prepare('INSERT INTO enrollments (contact_phone, course_id) VALUES (?, ?)').run(contactPhone, courseId);
  },

  getEnrollments(courseId) {
    return db.prepare(`
      SELECT e.*, c.name as contact_name, c.phone
      FROM enrollments e
      JOIN contacts c ON e.contact_phone = c.phone
      WHERE e.course_id = ?
      ORDER BY e.created_at DESC
    `).all(courseId);
  },

  getAllEnrollments() {
    return db.prepare(`
      SELECT e.*, c.name as contact_name, co.name as course_name
      FROM enrollments e
      JOIN contacts c ON e.contact_phone = c.phone
      JOIN courses co ON e.course_id = co.id
      ORDER BY e.created_at DESC
    `).all();
  },

  updateEnrollmentStatus(id, status) {
    return db.prepare('UPDATE enrollments SET status = ? WHERE id = ?').run(status, id);
  },

  // === Einstellungen ===
  getSetting(key) {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return row ? row.value : null;
  },

  setSetting(key, value) {
    return db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
  },

  getAllSettings() {
    const rows = db.prepare('SELECT * FROM settings').all();
    const obj = {};
    for (const row of rows) obj[row.key] = row.value;
    return obj;
  },

  // === Statistiken ===
  getStats() {
    return {
      totalContacts: db.prepare('SELECT COUNT(*) as count FROM contacts').get().count,
      totalMessages: db.prepare('SELECT COUNT(*) as count FROM messages').get().count,
      messagesIn: db.prepare('SELECT COUNT(*) as count FROM messages WHERE direction = "in"').get().count,
      messagesOut: db.prepare('SELECT COUNT(*) as count FROM messages WHERE direction = "out"').get().count,
      totalCourses: db.prepare('SELECT COUNT(*) as count FROM courses WHERE active = 1').get().count,
      totalEnrollments: db.prepare('SELECT COUNT(*) as count FROM enrollments WHERE status != "cancelled"').get().count,
      totalFaqs: db.prepare('SELECT COUNT(*) as count FROM faq WHERE active = 1').get().count,
      messagesToday: db.prepare('SELECT COUNT(*) as count FROM messages WHERE date(created_at) = date("now")').get().count,
      newContactsToday: db.prepare('SELECT COUNT(*) as count FROM contacts WHERE date(created_at) = date("now")').get().count,
      topFaqs: db.prepare('SELECT keyword, question, usage_count FROM faq WHERE active = 1 ORDER BY usage_count DESC LIMIT 5').all(),
    };
  },
};

module.exports = queries;
