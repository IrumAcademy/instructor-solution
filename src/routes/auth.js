const express = require('express');
const db = require('../db');
const { verifyPassword, signToken } = require('../auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const instructor = db.prepare('SELECT * FROM instructors WHERE email = ?').get(email);
  if (!instructor || !verifyPassword(password, instructor.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signToken({ sub: instructor.id });
  res.json({ token });
});

module.exports = router;
