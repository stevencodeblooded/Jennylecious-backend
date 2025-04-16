const Joi = require("joi");
const ErrorResponse = require("../utils/errorResponse");

/**
 * Middleware for validating request body, params, or query using Joi schema
 * @param {Object} schema - Joi schema object with body, params, query properties
 * @returns {Function} Express middleware function
 */
const validate = (schema) => (req, res, next) => {
  const validationOptions = {
    abortEarly: false, // Include all errors
    allowUnknown: true, // Ignore unknown props
    stripUnknown: true, // Remove unknown props
  };

  // Validate request body if schema.body is provided
  if (schema.body) {
    const { error, value } = schema.body.validate(req.body, validationOptions);

    if (error) {
      const errorDetails = error.details.map((detail) => detail.message);
      return next(new ErrorResponse(errorDetails.join(", "), 400));
    }

    req.body = value;
  }

  // Validate URL params if schema.params is provided
  if (schema.params) {
    const { error, value } = schema.params.validate(
      req.params,
      validationOptions
    );

    if (error) {
      const errorDetails = error.details.map((detail) => detail.message);
      return next(new ErrorResponse(errorDetails.join(", "), 400));
    }

    req.params = value;
  }

  // Validate query string if schema.query is provided
  if (schema.query) {
    const { error, value } = schema.query.validate(
      req.query,
      validationOptions
    );

    if (error) {
      const errorDetails = error.details.map((detail) => detail.message);
      return next(new ErrorResponse(errorDetails.join(", "), 400));
    }

    req.query = value;
  }

  next();
};

module.exports = validate;
