const errorHandler = (err, req, res, _next) => {
    console.error(`[Server Error] ${err.message}`);

    const statusCode = err.statusCode || err.status || 500;
    const isServerError = statusCode >= 500;

    res.status(statusCode).json({
        error: isServerError ? 'Internal server error' : (err.message || 'Request failed')
    });
};

module.exports = errorHandler;
