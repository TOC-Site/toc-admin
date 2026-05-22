require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const { init } = require('./database/db');

const app    = express();
const isProd = process.env.NODE_ENV === 'production';

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Lazily initialise DB — safe for serverless cold starts
let ready = false;
app.use(async (req, res, next) => {
  if (!ready) { await init(); ready = true; }
  next();
});

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// Only start HTTP server when running directly (not via Vercel)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`\n  TOC Admin  →  http://localhost:${PORT}`);
    console.log(`  API health →  http://localhost:${PORT}/api/health\n`);
  });
}

module.exports = app;
