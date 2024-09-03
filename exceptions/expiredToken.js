const HttpException = require("./root");

class ExpiredTokenException extends HttpException {
    constructor(message, errorCode) {
        super(message, errorCode, 404, null);
    }
}

module.exports = ExpiredTokenException;