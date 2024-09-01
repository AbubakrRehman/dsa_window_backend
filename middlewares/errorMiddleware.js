const errorMiddleware = (error, req, res, next) => {
    res.status(error.statusCode).json({
        message: error?.message,
        statusCode: error?.statusCode
    })
}

module.exports = errorMiddleware;