function notFound(req, res) {
  res.status(404).json({
    error: 'Route not found',
    message: `No endpoint exists for ${req.method} ${req.originalUrl}`
  });
}

function errorHandler(error, req, res, next) {
  console.error(error);
  if (res.headersSent) return next(error);

  if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({ error: 'Conflict', message: 'That value already exists.' });
  }
  if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    return res.status(400).json({ error: 'Invalid reference', message: 'The referenced rider or bike does not exist.' });
  }

  res.status(500).json({ error: 'Internal server error', message: 'Something went wrong on the server.' });
}

module.exports = { notFound, errorHandler };