export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log the actual error for developers
    console.error(`[Error] ${req.method} ${req.url}:`, {
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });

    res.status(statusCode).json({
        status: "error",
        code: statusCode,
        message: message,
        // Only show stack trace in development mode
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
