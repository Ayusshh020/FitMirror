const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (err.name === 'CastError' || err.kind === 'ObjectId') {
    let msg = 'Resource not found';
    if (req.originalUrl && req.originalUrl.includes('/garments')) {
      msg = 'Garment not found';
    } else if (req.originalUrl && req.originalUrl.includes('/saved-looks')) {
      msg = 'Saved look not found';
    }
    error = new ApiError(404, msg);
  } else if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    data: null,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
