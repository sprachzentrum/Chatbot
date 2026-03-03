const express = require('express');
const router = express.Router();
const { authenticate, requireAuth } = require('./auth');
const queries = require('../database/queries');
const { getStatus, sendMessage } = require('../whatsapp/client');

// --- Auth ---
router.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const valid = await authenticate(username, password);
  if (valid) {
    req.session.admin = username;
    return res.json({ success: true });
  }
  res.status(401).json({ error: 'Ungültige Zugangsdaten' });
});

router.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

router.get('/api/auth/check', (req, res) => {
  res.json({ authenticated: !!(req.session && req.session.admin) });
});

// --- Alle folgenden Routen erfordern Auth ---
router.use('/api', requireAuth);

// --- Dashboard / Statistiken ---
router.get('/api/stats', (req, res) => {
  res.json(queries.getStats());
});

// --- WhatsApp Status ---
router.get('/api/whatsapp/status', (req, res) => {
  res.json(getStatus());
});

// --- Kontakte ---
router.get('/api/contacts', (req, res) => {
  res.json(queries.getAllContacts());
});

router.put('/api/contacts/:phone', (req, res) => {
  queries.updateContact(req.params.phone, req.body);
  res.json({ success: true });
});

// --- Nachrichten ---
router.get('/api/messages/:phone', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json(queries.getMessages(req.params.phone, limit));
});

router.get('/api/messages', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  res.json(queries.getRecentMessages(limit));
});

router.post('/api/messages/send', async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ error: 'Telefonnummer und Nachricht erforderlich' });
  }
  try {
    await sendMessage(phone, message);
    queries.saveMessage(phone, 'out', message);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- FAQ ---
router.get('/api/faq', (req, res) => {
  res.json(queries.getAllFaqs());
});

router.post('/api/faq', (req, res) => {
  const result = queries.createFaq(req.body);
  res.json({ success: true, id: result.lastInsertRowid });
});

router.put('/api/faq/:id', (req, res) => {
  queries.updateFaq(parseInt(req.params.id), req.body);
  res.json({ success: true });
});

router.delete('/api/faq/:id', (req, res) => {
  queries.deleteFaq(parseInt(req.params.id));
  res.json({ success: true });
});

// --- Kurse ---
router.get('/api/courses', (req, res) => {
  res.json(queries.getAllCourses());
});

router.post('/api/courses', (req, res) => {
  const result = queries.createCourse(req.body);
  res.json({ success: true, id: result.lastInsertRowid });
});

router.put('/api/courses/:id', (req, res) => {
  queries.updateCourse(parseInt(req.params.id), req.body);
  res.json({ success: true });
});

router.delete('/api/courses/:id', (req, res) => {
  queries.deleteCourse(parseInt(req.params.id));
  res.json({ success: true });
});

// --- Anmeldungen ---
router.get('/api/enrollments', (req, res) => {
  res.json(queries.getAllEnrollments());
});

router.get('/api/enrollments/course/:id', (req, res) => {
  res.json(queries.getEnrollments(parseInt(req.params.id)));
});

router.put('/api/enrollments/:id/status', (req, res) => {
  queries.updateEnrollmentStatus(parseInt(req.params.id), req.body.status);
  res.json({ success: true });
});

// --- Einstellungen ---
router.get('/api/settings', (req, res) => {
  res.json(queries.getAllSettings());
});

router.put('/api/settings', (req, res) => {
  for (const [key, value] of Object.entries(req.body)) {
    queries.setSetting(key, value);
  }
  res.json({ success: true });
});

module.exports = router;
