class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.success = false; // Or determine based on statusCode if needed
        // Error.captureStackTrace(this, this.constructor); // Optional: for cleaner stack traces
    }
}

export { AppError };
