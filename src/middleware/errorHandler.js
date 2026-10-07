function notFound(req, res) {
  res.status(404).json({ message: 'Route not found' });
}

function errorHandler(error, req, res, next) {
  console.error(error);

  if (error.code === 11000) {
    return res.status(409).json({ message: 'Duplicate value already exists' });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id format' });
  }

  res.status(500).json({ message: 'Internal server error' });
}

module.exports = {
  notFound,
  errorHandler
};
