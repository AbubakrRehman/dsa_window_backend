
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const AlreadyExistException = require('../exceptions/alreadyExist');
const ErrorCode = require('../exceptions/errorCode');
const NotFoundException = require('../exceptions/notFound');

const prismaClient = new PrismaClient({
    // log: ['query']
})


const signup = async (req, res, next) => {

    const { email, password, name } = req.body;
    let user = await prismaClient.user.findFirst({
        where: { email: email }
    })

    if (user) {
        next(new AlreadyExistException("User already exists!!", ErrorCode.USER_ALREADY_EXIST)) 
    }

    user = await prismaClient.user.create({
        data: {
            name,
            email,
            password
        }
    })

    res.json(user)
}


const login = async (req, res, next) => {

    try {

        const { email, password } = req.body;
        let user = await prismaClient.user.findFirst({
            where: { email: email }
        })

        if (!user) {
            next(new NotFoundException("User does not exists!!", ErrorCode.USER_NOT_FOUND))
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



module.exports = { signup, login, me}



