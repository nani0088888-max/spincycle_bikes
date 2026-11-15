const app = require('./app');
const { initializeDatabase } = require('./database');

const PORT = process.env.PORT || 3000;

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`SpinCycle Bikes API running at http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });