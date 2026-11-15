const express = require('express');
const { run, get, all } = require('../database');
const { validateBike } = require('../utils/validation');

const router = express.Router();

// Keep this route before /:id so "summary" is not treated as an ID.
router.get('/summary', async (req, res, next) => {
  try {
    const rows = await all(`
      SELECT type, COUNT(*) AS count
      FROM bikes
      GROUP BY type
      ORDER BY type COLLATE NOCASE
    `);
    return res.status(200).json(rows);
  } catch (error) { next(error); }
});

router.get('/', async (req, res, next) => {
  try {
    const { type, status } = req.query;
    let sql = 'SELECT * FROM bikes';
    const conditions = [];
    const params = [];

    if (type) { conditions.push('LOWER(type) = LOWER(?)'); params.push(type.trim()); }
    if (status) {
      if (!['available', 'rented', 'maintenance'].includes(status)) {
        return res.status(400).json({ error: 'Validation error', message: "status query must be 'available', 'rented', or 'maintenance'." });
      }
      conditions.push('status = ?'); params.push(status);
    }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY id';
    res.status(200).json(await all(sql, params));
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const bike = await get('SELECT * FROM bikes WHERE id = ?', [req.params.id]);
    if (!bike) return res.status(404).json({ error: 'Not found', message: 'Bike not found.' });
    res.status(200).json(bike);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const errors = validateBike(req.body);
    if (errors.length) return res.status(400).json({ error: 'Validation error', messages: errors });

    const { name, type, status = 'available' } = req.body;
    const result = await run(
      'INSERT INTO bikes (name, type, status) VALUES (?, ?, ?)',
      [name.trim(), type.trim(), status]
    );
    const bike = await get('SELECT * FROM bikes WHERE id = ?', [result.id]);
    res.status(201).json(bike);
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const errors = validateBike(req.body, true);
    if (errors.length) return res.status(400).json({ error: 'Validation error', messages: errors });

    const existing = await get('SELECT * FROM bikes WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Not found', message: 'Bike not found.' });

    const updated = {
      name: req.body.name === undefined ? existing.name : req.body.name.trim(),
      type: req.body.type === undefined ? existing.type : req.body.type.trim(),
      status: req.body.status === undefined ? existing.status : req.body.status
    };
    await run('UPDATE bikes SET name = ?, type = ?, status = ? WHERE id = ?',
      [updated.name, updated.type, updated.status, req.params.id]);
    res.status(200).json(await get('SELECT * FROM bikes WHERE id = ?', [req.params.id]));
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await get('SELECT * FROM bikes WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Not found', message: 'Bike not found.' });
    try {
      await run('DELETE FROM bikes WHERE id = ?', [req.params.id]);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        return res.status(409).json({ error: 'Cannot delete bike', message: 'This bike has rental history. Keep it in the database.' });
      }
      throw error;
    }
    res.status(200).json({ message: 'Bike deleted successfully.', bike: existing });
  } catch (error) { next(error); }
});

module.exports = router;