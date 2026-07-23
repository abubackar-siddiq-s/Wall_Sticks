import { validationResult } from 'express-validator'

// Runs after an array of express-validator checks on a route; short-circuits
// with a 400 + field-level messages instead of letting bad data reach a controller.
export function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    })
  }
  next()
}
