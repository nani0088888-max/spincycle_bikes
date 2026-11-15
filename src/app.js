const express = require('express');
const bikesRouter = require('./routes/bikes');
const ridersRouter = require('./routes/riders');
const rentalsRouter = require('./routes/rentals');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    name: 'SpinCycle Bikes API',
    message: 'Campus bike-share backend is running.',
    endpoints: {
      bikes: '/bikes',
      bikeSummary: '/bikes/summary',
      riders: '/riders',
      rentals: '/rentals',
      rentalJoin: '/rentals/join'
    }
  });
});

app.use('/bikes', bikesRouter);
app.use('/riders', ridersRouter);
app.use('/rentals', rentalsRouter);
app.use(notFound);
app.use(errorHandler);

module.exports = app;