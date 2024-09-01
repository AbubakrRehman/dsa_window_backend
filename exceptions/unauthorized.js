const HttpException = require("./root");

class UnauthorizedException extends HttpException {
    constructor(message, errorCode) {
        super(message, errorCode, 401, null);
    }
}

module.exports = UnauthorizedException;