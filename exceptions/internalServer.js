const HttpException = require("./root");

class InternalServerException extends HttpException {
    constructor(message, errorCode) {
        super(message, errorCode, 500, null);
    }
}

module.exports = InternalServerException;