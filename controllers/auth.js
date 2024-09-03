
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const { PrismaClient } = require('@prisma/client');
const AlreadyExistException = require('../exceptions/alreadyExist');
const ErrorCode = require('../exceptions/errorCode');
const NotFoundException = require('../exceptions/notFound');
const ExpiredTokenException = require('../exceptions/expiredToken');
const BadRequestException = require('../exceptions/badRequest');

const prismaClient = new PrismaClient({
    // log: ['query']
})


const signup = async (req, res, next) => {

    const { email, password, name } = req.body;
    let user = await prismaClient.user.findFirst({
        where: { email: email }
    })

    if (user) {
        return next(new AlreadyExistException("User already exists!!", ErrorCode.USER_ALREADY_EXIST))
    }

    try {
        let createdUser = await prismaClient.user.create({
            data: {
                name: "",
                email: email,
                password: password
            }
        })

        const token = jwt.sign({
            userId: createdUser.id
        }, 'SECRET_KEY');

        res.json({ user: createdUser, token: token })

    } catch (err) {
        console.log("error", err);
    }










}


const login = async (req, res, next) => {

    try {
        const { email, password } = req.body;
        let user = await prismaClient.user.findFirst({
            where: { email: email }
        })

        if (!user) {
            return next(new NotFoundException("User does not exists!!", ErrorCode.USER_NOT_FOUND))
        }

        if(password !== user.password) {
            return next(new BadRequestException("Password doesn't match", ErrorCode.PASSWORD_DOESNT_EXIST))
        }

        const token = jwt.sign({
            userId: user.id
        }, 'SECRET_KEY')

        res.json({ user, token })

    } catch (error) {
        next(error)
    }
}


const me = async (req, res, next) => {

    if (!req.user) {
        next(new NotFoundException("User does not exists!!", ErrorCode.USER_NOT_FOUND))
    }

    res.json(req.user)
}


const forgetPassword = async (req, res, next) => {

    const SECRET_KEY = '1234567';
    const { email } = req.body;

    const user = await prismaClient.user.findFirst({
        where: {
            email: email
        }
    })

    if (!user) {
        return next(new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND))
    }

    let token = jwt.sign({ userId: user.id }, SECRET_KEY, {
        expiresIn: 2 * 60
    })

    //if theres already a passwordResetToken then delete and inset this one

    // const passwordResetToken = await prismaClient.passwordResetToken.findFirst({
    //     where: {
    //         title: token
    //     }
    // })


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

        const link = `http://localhost:3000/reset-password/${token}`;

        let transporter = nodemailer.createTransport({
            host: 'live.smtp.mailtrap.io',
            port: 587,

            auth: {
                user: 'api',
                pass: '4deb65af0d8e68f9c5f4cd5d606d85e7'

            }
        });

        try {
            const info = await transporter.sendMail({
                from: 'mailtrap@demomailtrap.com', // sender address
                to: email, // list of receivers
                subject: "Password Reset Request", // Subject line
                text: "Hello world?", // plain text body
                html:
                    `
                <head>
                    <style>
                    .reset-password-btn {
                        padding: 5px 10px;
                        background-color: gray;
                        color: white;
                        text-transform: uppercase;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                    </style>
                </head>
                
                <body>
                    <h1>Please reset your password</h1>
                    <div>
                        <p>Hello,</p>
                        <p>We have sent you this email in response to your request to reset your password on DSA Window.</p>
                        <p>To reset your password, please follow the link below:</p>
                    
                    </div>
                    <a href=${link} class="reset-password-btn">Reset Password</a>
                </body>
                </html>`
            });

            res.status(200).json({ message: "Mail sent successfully." })
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

    const SECRET_KEY = '1234567';
    try {
        payload = jwt.verify(token, SECRET_KEY);
        await prismaClient.user.update({
            where: {
                id: +payload.userId
            }, data: {
                password: password
            }
        })

        try{
            await prismaClient.passwordResetToken.delete({
                where : {
                    title: token,
                    userId: payload.userId 
                }
            })
        } catch(err) {
            console.log("err", err);
        }
       

        res.json({message: "Password Reset successful"})

    } catch (err) {
        return next(new BadRequestException("Token is Expired", ErrorCode.EXPIRED_TOKEN))
    }
}

const verifyToken = async (req, res, next) => {
    const { token } = req.params;

    const passwordResetToken = await prismaClient.passwordResetToken.findFirst({
        where: {
            title: token
        }
    })

    if (!passwordResetToken) {
        return next(new BadRequestException("Token is Invalid", ErrorCode.EXPIRED_TOKEN))
    }

    const SECRET_KEY = '1234567';
    try {
        payload = jwt.verify(token, SECRET_KEY);
        res.json({ message: "Token is Valid" });
    } catch (err) {
        return next(new BadRequestException("Token is Invalid", ErrorCode.EXPIRED_TOKEN))
    }
}


module.exports = { signup, login, me, forgetPassword, resetPassword, verifyToken }



