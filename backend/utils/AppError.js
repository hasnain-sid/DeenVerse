class AppError extends Error {
    constructor(message, statusCode, errors) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
        this.errors = errors || null;
        Error.captureStackTrace(this, this.constructor);
    }
}

export { AppError };
