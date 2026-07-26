export function notFound(req, res, next) {
  res.status(404)
  next(new Error(`Not found — ${req.originalUrl}`))
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let statusCode = res.statusCode
  if (err.statusCode) {
    statusCode = err.statusCode
  } else if (err.status) {
    statusCode = err.status
  } else if (!statusCode || statusCode === 200) {
    statusCode = 500
  }
  
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  })
}
