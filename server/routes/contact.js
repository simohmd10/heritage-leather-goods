const express = require('express');
const db = require('../db');

const router = express.Router();

// POST /api/contact
router.post('/', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required' });
  }

  db.prepare(
    'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)'
  ).run(name.trim(), email.toLowerCase(), subject || null, message.trim());

  res.json({ message: 'Message sent successfully. We will get back to you within 24 hours.' });
});

module.exports = router;
