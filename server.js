const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'database.json');
const SESSIONS = new Map(); // in-memory session store: sessionId -> {username, role, createdAt}

// Simple user accounts (mirrors ROLE_ACCOUNTS in index.html for password verification)
const ACCOUNTS = {
  admin: { username: 'admin', label: 'admin', role: 'admin', passwordHash: 'a89f66c8aa825322ede067a00a0f5ba9db7a9eb1164752fd277e8dde72416b1d' },
  panuska: { username: 'panuska@akpanuska.cz', label: 'panuska@akpanuska.cz', role: 'admin', passwordHash: '03126cdc3bde481e80999f6626dae4971e864d9ad0455db14d13c0f66f9f3235' },
  'advokat-a': { username: 'advokat-a', label: 'advokát A', role: 'advokat-a', passwordHash: 'cf914427ac9028b2e7e49fd3d09034bbc9dcfb7ff6af3c340a52fd1a1f26b86d' },
  'advokat-b': { username: 'advokat-b', label: 'advokát B', role: 'advokat-b', passwordHash: '4fc15d83edb0833a20cbcc82fa274eb8ea375e7bd00b19f8ff59e1b92c79d3a4' }
};

app.use(express.json());
app.use(express.static(__dirname));

// Helper: read database from disk
function readDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (e) {
    return { schema: 'pravni-radce-db-v2', version: 2, clients: [] };
  }
}

// Helper: write database to disk
function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  return true;
}

// Middleware: require valid session
function requireAuth(req, res, next) {
  const sid = req.headers['x-session-id'];
  if (!sid || !SESSIONS.has(sid)) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  req.session = SESSIONS.get(sid);
  next();
}

// ----- API Endpoints -----

// Get current session
app.get('/api/session', (req, res) => {
  const sid = req.headers['x-session-id'];
  if (sid && SESSIONS.has(sid)) {
    res.json({ authenticated: true, session: SESSIONS.get(sid) });
  } else {
    res.json({ authenticated: false });
  }
});

// Login
app.post('/api/login', (req, res) => {
  const { accountKey, password } = req.body;
  const account = ACCOUNTS[accountKey];
  if (!account) {
    return res.status(401).json({ error: 'Neplatný účet' });
  }
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  if (hash !== account.passwordHash) {
    return res.status(401).json({ error: 'Neplatné heslo' });
  }
  const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2);
  SESSIONS.set(sessionId, {
    accountKey,
    username: account.username,
    role: account.role,
    createdAt: new Date().toISOString()
  });
  res.json({ ok: true, sessionId, role: account.role, username: account.username });
});

// Logout
app.post('/api/logout', (req, res) => {
  const sid = req.headers['x-session-id'];
  if (sid) SESSIONS.delete(sid);
  res.json({ ok: true });
});

// Get database
app.get('/api/db', (req, res) => {
  try {
    const data = readDb();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Cannot read database' });
  }
});

// Save database (requires auth)
app.put('/api/db', requireAuth, (req, res) => {
  try {
    const data = req.body;
    if (!data || !data.schema) {
      return res.status(400).json({ error: 'Invalid database format' });
    }
    data.updatedAt = new Date().toISOString().slice(0, 10);
    writeDb(data);
    res.json({ ok: true, updatedAt: data.updatedAt });
  } catch (e) {
    res.status(500).json({ error: 'Cannot write database: ' + e.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Právní rádce backend running on http://localhost:${PORT}`);
  console.log(`Database path: ${DB_PATH}`);
});
