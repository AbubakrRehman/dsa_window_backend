const ErrorCode = require("../exceptions/errorCode");
const UnauthorizedException = require("../exceptions/unauthorized");
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prismaClient = new PrismaClient({
    // log: ['query']
})

const adminMiddleware = async (req, res, next) => {

        const userRole = req.user.role;

        if (userRole !== 'ADMIN') {
            next(new UnauthorizedException("Unauthorized User", ErrorCode.UNAUTHARIZED))
        }

        next();
}

module.exports = adminMiddleware;