import logger from "../config/logger.js";

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log errors with structured context
    const logMeta = {
      statusCode,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userId: req.user || null,
    };

    if (statusCode >= 500) {
      logger.error(err.message, { ...logMeta, stack: err.stack });
    } else if (statusCode >= 400) {
      logger.warn(err.message, logMeta);
    }

    // For JWT authentication errors, you might want to send a 401
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            success: false,
            message: "Invalid token or unauthorized access.",
        });
    }
    
    // Add more specific error handling as needed
    // if (err.name === 'ValidationError') { // Example for Mongoose validation errors
    //     return res.status(400).json({
    //         success: false,
    //         message: err.message,
    //         errors: err.errors // Optional: send specific validation errors
    //     });
    // }

    const response = {
        success: false,
        message: message,
    };
    if (err.errors) response.errors = err.errors;
    if (process.env.NODE_ENV === 'development') response.stack = err.stack;
    return res.status(statusCode).json(response);
};

export default errorHandler;
