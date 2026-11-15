const express = require('express');
const { run, get, all } = require('../database');
const { validateRider } = require('../utils/validation');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try { res.status(200).json(await all('SELECT * FROM riders ORDER BY id')); }
  catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const rider = await get('SELECT * FROM riders WHERE id = ?', [req.params.id]);
    if (!rider) return res.status(404).json({ error: 'Not found', message: 'Rider not found.' });
    res.status(200).json(rider);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const errors = validateRider(req.body);
    if (errors.length) return res.status(400).json({ error: 'Validation error', messages: errors });
    const { name, email, phone = null } = req.body;
    const result = await run('INSERT INTO riders (name, email, phone) VALUES (?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), phone]);
    res.status(201).json(await get('SELECT * FROM riders WHERE id = ?', [result.id]));
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const errors = validateRider(req.body, true);
    if (errors.length) return res.status(400).json({ error: 'Validation error', messages: errors });
    const old = await get('SELECT * FROM riders WHERE id = ?', [req.params.id]);
    if (!old) return res.status(404).json({ error: 'Not found', message: 'Rider not found.' });
    const value = {
      name: req.body.name === undefined ? old.name : req.body.name.trim(),
      email: req.body.email === undefined ? old.email : req.body.email.trim().toLowerCase(),
      phone: req.body.phone === undefined ? old.phone : req.body.phone
    };
    await run('UPDATE riders SET name = ?, email = ?, phone = ? WHERE id = ?',
      [value.name, value.email, value.phone, req.params.id]);
    res.status(200).json(await get('SELECT * FROM riders WHERE id = ?', [req.params.id]));
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const old = await get('SELECT * FROM riders WHERE id = ?', [req.params.id]);
    if (!old) return res.status(404).json({ error: 'Not found', message: 'Rider not found.' });
    try { await run('DELETE FROM riders WHERE id = ?', [req.params.id]); }
    catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        return res.status(409).json({ error: 'Cannot delete rider', message: 'This rider has rental history.' });
      }
      throw error;
    }
    res.status(200).json({ message: 'Rider deleted successfully.', rider: old });
  } catch (error) { next(error); }
});

module.exports = router;