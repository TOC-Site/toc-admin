const express     = require('express');
const bcrypt      = require('bcryptjs');
const jwt         = require('jsonwebtoken');
const { client }  = require('../database/db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const { rows } = await client.execute({
      sql:  'SELECT * FROM admin_users WHERE email = ?',
      args: [email.trim().toLowerCase()],
    });
    const user = rows[0];
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/setup', async (req, res) => {
  try {
    const { rows } = await client.execute('SELECT COUNT(*) as c FROM admin_users');
    if (Number(rows[0].c) > 0) return res.status(403).json({ error: 'Setup already complete. Use login.' });

    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const hash = bcrypt.hashSync(password, 12);
    await client.execute({
      sql:  'INSERT INTO admin_users (email, password_hash, name) VALUES (?, ?, ?)',
      args: [email.trim().toLowerCase(), hash, name || 'Admin'],
    });
    res.json({ message: 'Admin account created. You can now log in.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await client.execute({
      sql:  'SELECT id, email, name FROM admin_users WHERE id = ?',
      args: [req.user.id],
    });
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/needs-setup', async (req, res) => {
  try {
    const { rows } = await client.execute('SELECT COUNT(*) as c FROM admin_users');
    res.json({ needsSetup: Number(rows[0].c) === 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
