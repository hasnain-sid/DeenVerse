const errorHandler = (err, req, res, next) => {
    console.error("ERROR ===>", err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

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

    return res.status(statusCode).json({
        success: false,
        message: message,
        // Optionally, in development, you might want to send the stack trace
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

export default errorHandler;
