const HttpException = require("./root");

class AlreadyExistException extends HttpException {
    constructor(message, errorCode) {
        super(message, errorCode, 403, null);
    }
}

module.exports = AlreadyExistException;