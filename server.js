const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Serve static HTML files
app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────

// POST /api/login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'hostel123') {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Ghalat username ya password' });
  }
});

// ─────────────────────────────────────────────
//  MEMBERS — get all
// ─────────────────────────────────────────────

// GET /api/members
app.get('/api/members', (req, res) => {
  db.all('SELECT * FROM members ORDER BY name ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ─────────────────────────────────────────────
//  MEMBERS — update paid amount
// ─────────────────────────────────────────────

// PUT /api/members/:name/paid
app.put('/api/members/:name/paid', (req, res) => {
  const { name } = req.params;
  const { paid } = req.body;
  const remaining = 1500 - (paid || 0);

  db.run(
    'UPDATE members SET paid = ?, remaining = ?, updated_at = CURRENT_TIMESTAMP WHERE name = ?',
    [paid || 0, remaining, name],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Member nahi mila' });
      res.json({ success: true, name, paid, remaining });
    }
  );
});

// ─────────────────────────────────────────────
//  MEMBERS — reset all paid amounts
// ─────────────────────────────────────────────

// POST /api/members/reset-paid
app.post('/api/members/reset-paid', (req, res) => {
  db.run('UPDATE members SET paid = 0, remaining = 1500, updated_at = CURRENT_TIMESTAMP', [], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Sab members ka paid reset ho gaya' });
  });
});

// ─────────────────────────────────────────────
//  EXPENSES — get all
// ─────────────────────────────────────────────

// GET /api/expenses
app.get('/api/expenses', (req, res) => {
  db.all('SELECT * FROM expenses ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ─────────────────────────────────────────────
//  EXPENSES — add new
// ─────────────────────────────────────────────

// POST /api/expenses
app.post('/api/expenses', (req, res) => {
  const { amount, note } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Amount sahi nahi' });

  db.run(
    'INSERT INTO expenses (amount, note) VALUES (?, ?)',
    [amount, note || ''],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID, amount, note });
    }
  );
});

// ─────────────────────────────────────────────
//  EXPENSES — reset/delete all
// ─────────────────────────────────────────────

// DELETE /api/expenses/reset
app.delete('/api/expenses/reset', (req, res) => {
  db.run('DELETE FROM expenses', [], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Expenses history reset ho gayi' });
  });
});

// ─────────────────────────────────────────────
//  SUMMARY — total paid + total expenses + balance
// ─────────────────────────────────────────────

// GET /api/summary
app.get('/api/summary', (req, res) => {
  db.get('SELECT COALESCE(SUM(paid),0) as totalPaid FROM members', [], (err, row1) => {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT COALESCE(SUM(amount),0) as totalExpense FROM expenses', [], (err2, row2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      const totalPaid = row1.totalPaid;
      const totalExpense = row2.totalExpense;
      const balance = totalPaid - totalExpense;
      res.json({ totalPaid, totalExpense, balance });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server chal raha hai: http://localhost:${PORT}`);
  console.log(`📂 API endpoints ready!`);
});
