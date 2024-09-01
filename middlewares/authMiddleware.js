const ErrorCode = require("../exceptions/errorCode");
const UnauthorizedException = require("../exceptions/unauthorized");
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prismaClient = new PrismaClient({
    // log: ['query']
})

const authMiddleware = async (req, res, next) => {

    const token = req.headers.authorization;
    if (!token) {
        return next(new UnauthorizedException("Unauthorized User", ErrorCode.UNAUTHARIZED))
    }

    try {

        const payload = jwt.verify(token, 'SECRET_KEY');

        let user = await prismaClient.user.findFirst({
            where: { id: payload.userId },
            include: {
                profilePic: true
            }
        })


        if (user.profilePic) {
            user.profilePic = `http://localhost:8090/api/files/${user.profilePic.id}`;
        }


        if (!user) {
            return next(new UnauthorizedException("Unauthorized User", ErrorCode.UNAUTHARIZED))
        }

        req.user = user;
        next();
    } catch (error) {
        return next(new UnauthorizedException("Unauthorized User", ErrorCode.UNAUTHARIZED))
    }
}

module.exports = authMiddleware;