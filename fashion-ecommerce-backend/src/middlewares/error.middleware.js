/**
 * Error Handler Middleware - Xử lý lỗi toàn cục
 */

// Custom error class
class APIError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
    console.error("[ERROR]", {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    // Default error
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map(e => e.message)
            .join(", ");
    }

    // Mongoose cast error
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID format";
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        statusCode = 400;
        message = `${field} already exists`;
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }

    // Send error response
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
};

// 404 Not Found middleware
const notFound = (req, res, next) => {
    return res.status(404).json({
        success: false,
        statusCode: 404,
        message: `Route ${req.method} ${req.path} not found`
    });
};

// Async error wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    APIError,
    errorHandler,
    notFound,
    asyncHandler
};
