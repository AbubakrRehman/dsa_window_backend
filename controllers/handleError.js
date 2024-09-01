const ErrorCode = require("../exceptions/errorCode");
const InternalServerException = require("../exceptions/internalServer");
const HttpException = require("../exceptions/root");

const handleError = (method) => {
    return async (req, res, next) => {
        try {
            await method(req, res, next);
        } catch (error) {
            if(error instanceof HttpException) {
                next(error)
            } else {
                next(new InternalServerException('Something went wrong', ErrorCode.INTERNAL_SERVER_ERROR))
            }
        }
    }
}

module.exports = handleError;