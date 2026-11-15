const express = require('express');
const { run, get, all } = require('../database');
const router = express.Router();

// Required join endpoint: rental rows with rider and bike names.
router.get('/join', async (req, res, next) => {
  try {
    const rows = await all(`
      SELECT rentals.id, rentals.rider_id, riders.name AS rider_name,
             rentals.bike_id, bikes.name AS bike_name, bikes.type AS bike_type,
             rentals.rented_at, rentals.returned_at, rentals.status
      FROM rentals
      INNER JOIN riders ON rentals.rider_id = riders.id
      INNER JOIN bikes ON rentals.bike_id = bikes.id
      ORDER BY rentals.id DESC
    `);
    res.status(200).json(rows);
  } catch (error) { next(error); }
});

router.get('/', async (req, res, next) => {
  try { res.status(200).json(await all('SELECT * FROM rentals ORDER BY id DESC')); }
  catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const { rider_id, bike_id } = req.body;
    const errors = [];
    if (!Number.isInteger(rider_id) || rider_id < 1) errors.push('rider_id must be a positive integer.');
    if (!Number.isInteger(bike_id) || bike_id < 1) errors.push('bike_id must be a positive integer.');
    if (errors.length) return res.status(400).json({ error: 'Validation error', messages: errors });

    const rider = await get('SELECT id FROM riders WHERE id = ?', [rider_id]);
    if (!rider) return res.status(404).json({ error: 'Rider not found', message: 'Create the rider before starting a rental.' });
    const bike = await get('SELECT * FROM bikes WHERE id = ?', [bike_id]);
    if (!bike) return res.status(404).json({ error: 'Bike not found', message: 'Bike does not exist.' });
    if (bike.status !== 'available') {
      return res.status(409).json({ error: 'Bike unavailable', message: `Bike status is '${bike.status}'. Only available bikes can be rented.` });
    }

    await run('BEGIN IMMEDIATE');
    try {
      const result = await run('INSERT INTO rentals (rider_id, bike_id) VALUES (?, ?)', [rider_id, bike_id]);
      await run("UPDATE bikes SET status = 'rented' WHERE id = ?", [bike_id]);
      await run('COMMIT');
      res.status(201).json(await get('SELECT * FROM rentals WHERE id = ?', [result.id]));
    } catch (error) {
      await run('ROLLBACK');
      throw error;
    }
  } catch (error) { next(error); }
});

router.patch('/:id/return', async (req, res, next) => {
  try {
    const rental = await get('SELECT * FROM rentals WHERE id = ?', [req.params.id]);
    if (!rental) return res.status(404).json({ error: 'Not found', message: 'Rental not found.' });
    if (rental.status === 'returned') {
      return res.status(409).json({ error: 'Already returned', message: 'This rental has already been returned.' });
    }
    await run('BEGIN IMMEDIATE');
    try {
      await run("UPDATE rentals SET status = 'returned', returned_at = CURRENT_TIMESTAMP WHERE id = ?", [req.params.id]);
      await run("UPDATE bikes SET status = 'available' WHERE id = ?", [rental.bike_id]);
      await run('COMMIT');
    } catch (error) {
      await run('ROLLBACK');
      throw error;
    }
    res.status(200).json(await get('SELECT * FROM rentals WHERE id = ?', [req.params.id]));
  } catch (error) { next(error); }
});

module.exports = router;