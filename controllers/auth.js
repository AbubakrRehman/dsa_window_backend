
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const AlreadyExistException = require('../exceptions/alreadyExist');
const ErrorCode = require('../exceptions/errorCode');
const NotFoundException = require('../exceptions/notFound');
const ExpiredTokenException = require('../exceptions/expiredToken');
const BadRequestException = require('../exceptions/badRequest');
const { sendMail, getEmailVerificationTemplate, getPasswordResetEmailTemplate } = require('../utils');

const prismaClient = new PrismaClient({
    // log: ['query']
})


const signup = async (req, res, next) => {

    const { email, password, name } = req.body;
    let user = await prismaClient.user.findFirst({
        where: { email: email }
    })

    if (user && user.isVerified) {
        return next(new AlreadyExistException("User already exists!!", ErrorCode.USER_ALREADY_EXIST))
    }

    if (!user) {
        let createdUser = await prismaClient.user.create({
            data: {
                name: "",
                email: email,
                password: password
            }
        })

        const emailVerificationToken = jwt.sign({
            userId: createdUser.id
        }, 'EV_SECRET_KEY');

        await prismaClient.emailVerificationToken.create({
            data: {
                title: emailVerificationToken,
                userId: createdUser.id
            }
        })

        const link = `"http://localhost:8090/api/auth/verify-email/${emailVerificationToken}"`;
        const emailHTML = getEmailVerificationTemplate(link);
        try {
            await sendMail(email, "Email Verification Request", "", emailHTML);
            return res.json({ message: "User registered sucessfully." })
        } catch (err) {

            await prismaClient.emailVerificationToken.delete({
                where: {
                    userId: createdUser.id
                }
            })

            await prismaClient.user.delete({
                where: {
                    id: createdUser.id
                }
            })

            return next(new BadRequestException("User registration failed", ErrorCode.USER_NOT_FOUND))
        }
    }


    if (user && !user.isVerified) {

        try {
            await prismaClient.emailVerificationToken.delete({
                where: {
                    userId: user.id
                }
            })
        } catch (err) {
            console.log("token already deleted from dtabase");
        }

        const emailVerificationToken = jwt.sign({
            userId: user.id
        }, 'EV_SECRET_KEY');

        await prismaClient.emailVerificationToken.create({
            data: {
                title: emailVerificationToken,
                userId: user.id
            }
        })

        const link = `"http://localhost:8090/api/auth/verify-email/${emailVerificationToken}"`;
        const emailHTML = getEmailVerificationTemplate(link);

        await sendMail(email, "Email Verification Request", "", emailHTML);
        res.json({ message: "verification link is sent to your mail. Please verify." })

    }
}

const login = async (req, res, next) => {

    const { email, password } = req.body;
    let user = await prismaClient.user.findFirst({
        where: { email: email }
    })

    if (!user) {
        return next(new NotFoundException("User does not exists!!", ErrorCode.USER_NOT_FOUND))
    }

    if (user && !user.isVerified) {

        try {
            await prismaClient.emailVerificationToken.delete({
                where: {
                    userId: user.id
                }
            })
        } catch (err) {
            console.log("deletion error");
        }

        const emailVerificationToken = jwt.sign({
            userId: user.id
        }, 'EV_SECRET_KEY');

        await prismaClient.emailVerificationToken.create({
            data: {
                title: emailVerificationToken,
                userId: user.id
            }
        })

        const link = `"http://localhost:8090/api/auth/verify-email/${emailVerificationToken}"`;
        const emailHTML = getEmailVerificationTemplate(link);
        
        await sendMail(email, "Email Verification Request", "", emailHTML);
        return res.json({ message: "verification link has been sent to your email.Pls verify" })
    }

    if (password !== user.password) {
        return next(new BadRequestException("Password doesn't match", ErrorCode.PASSWORD_DOESNT_EXIST))
    }

    const token = jwt.sign({
        userId: user.id
    }, 'SECRET_KEY')

    return res.json({ user, token })
}


const me = async (req, res, next) => {

    if (!req.user) {
        next(new NotFoundException("User does not exists!!", ErrorCode.USER_NOT_FOUND))
    }

    res.json(req.user)
}


const emailPasswordResetLink = async (req, res, next) => {

    const { email } = req.body;
    const user = await prismaClient.user.findFirst({
        where: {
            email: email
        }
    })

    if (!user) {
        return next(new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND))
    }

    let token = jwt.sign({ userId: user.id }, "Password_Reset_Token", {
        expiresIn: 2 * 60
    })

    try {
        const deletedpasswordResetToken = await prismaClient.passwordResetToken.delete({
            where: {
                userId: +user.id
            }
        })
    } catch (err) {
        console.log("delete error");
    }

    finally {
        await prismaClient.passwordResetToken.create({
            data: {
                title: token,
                userId: user.id
            }
        })

        const link = `"http://localhost:3000/reset-password/${token}"`;
        const emailHTML = getPasswordResetEmailTemplate(link);

        try {
            await sendMail(email, "Password Reset Request", "", emailHTML);
            res.status(200).json({ message: "Mail sent successfully." });
        } catch (err) {
            res.status(400).json({ message: "Email Transfer Failed" })
        }
    }
}


const resetPassword = async (req, res, next) => {

    const { token, password } = req.body;
    let payload;

    const passwordResetToken = await prismaClient.passwordResetToken.findFirst({
        where: {
            title: token
        }
    })

    if (!passwordResetToken) {
        return next(new BadRequestException("Token is Expired", ErrorCode.EXPIRED_TOKEN))
    }

    try {
        payload = jwt.verify(token, 'Password_Reset_Token');
        await prismaClient.user.update({
            where: {
                id: +payload.userId
            }, data: {
                password: password
            }
        })

        try {
            await prismaClient.passwordResetToken.delete({
                where: {
                    title: token,
                    userId: payload.userId
                }
            })
        } catch (err) {
            console.log("err", err);
        }


        res.json({ message: "Password Reset successful" })

    } catch (err) {
        return next(new BadRequestException("Token is Expired", ErrorCode.EXPIRED_TOKEN))
    }
}

const verifyPasswordResetToken = async (req, res, next) => {
    const { token } = req.body;

    const passwordResetToken = await prismaClient.passwordResetToken.findFirst({
        where: {
            title: token
        }
    })

    if (!passwordResetToken) {
        return next(new BadRequestException("Token is Invalid", ErrorCode.EXPIRED_TOKEN))
    }

    try {
        payload = jwt.verify(token, 'Password_Reset_Token');
        res.json({ message: "Token is Valid" });
    } catch (err) {
        return next(new BadRequestException("Token is Invalid", ErrorCode.EXPIRED_TOKEN))
    }
}

const verifyEmail = async (req, res, next) => {
    const { token } = req.params;

    try {
        let payload = jwt.verify(token, 'EV_SECRET_KEY');

        const user = await prismaClient.user.findFirst({
            where: {
                id: payload.userId
            }
        })

        if (user.isVerified) {
            return res.render("email_verification_result", { emailVerified: true })
        }

        const emailVerificationToken = await prismaClient.emailVerificationToken.findFirst({
            where: {
                title: token
            }
        })

        if (!emailVerificationToken) {
            return res.render("email_verification_result", { emailVerified: false })
        }

        await prismaClient.user.update({
            where: {
                id: payload.userId
            }, data: {
                isVerified: true
            }
        })

        await prismaClient.emailVerificationToken.delete({
            where: {
                id: emailVerificationToken.id
            }
        })

        return res.render("email_verification_result", { emailVerified: true })
    } catch (err) {
        return res.render("email_verification_result", { emailVerified: false })
    }
}


module.exports = { verifyEmail, signup, login, me, emailPasswordResetLink, resetPassword, verifyPasswordResetToken }



