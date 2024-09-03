
const { PrismaClient } = require('@prisma/client');
const NotFoundException = require('../exceptions/notFound');
const ErrorCode = require('../exceptions/errorCode');
const BadRequestException = require('../exceptions/badRequest');

const fs = require("fs");


const prismaClient = new PrismaClient({
    // log: ['query']
})

const getUserById = async (req, res, next) => {

    try {
        const user = await prismaClient.user.findFirstOrThrow({
            where: {
                id: +req.params.userId
            }
        });
        res.json(user);

    } catch (error) {
        next(new NotFoundException("User Not Found", ErrorCode.USER_NOT_FOUND))
    }
}


const getAllUsers = async (req, res, next) => {

    const recordsPerPage = 10;
    let defaultRoles = ['ADMIN', 'USER'];

    let { page, search, role, sortBy } = req.query;
    let roles = role?.split(",");
    roles = roles?.map((role) => role.toUpperCase())

    let order = sortBy.substring(0,1);
    sortBy = sortBy.substring(1,)

    let orderBy = {};
    orderBy[`${sortBy}`] = order === '-' ? 'desc': 'asc';

    const allUsers = await prismaClient.user.findMany({
        where: {
            name: {
                contains: search
            }, email: {
                contains: search
            },
            role: {
                in: roles ? roles : defaultRoles
            }
        }
    });

    const users = await prismaClient.user.findMany({
        where: {
            name: {
                contains: search
            }, email: {
                contains: search
            },
            role: {
                in: roles ? roles : defaultRoles
            }
        },
        orderBy: [
            orderBy
        ],
        skip: (+req.query.page - 1) * recordsPerPage,
        take: recordsPerPage
    });

    res.json({
        count: Math.ceil(allUsers.length / recordsPerPage),
        items: users

    });
}

const deleteUser = async (req, res, next) => {

    const user = await prismaClient.user.delete({
        where: {
            id: +req.params.userId
        }
    });
    res.json(user);
}

const updateUserById = async (req, res, next) => {

    const user = await prismaClient.user.update({
        where: {
            id: +req.params.userId
        }, data: {
            role: req.body.role
        }
    });
    res.json(user);
}

const updateUser = async (req, res, next) => {

    const profilePic = await prismaClient.profilePic.findFirst({
        where: {
            userId: +req.user.id
        }
    })


    if (profilePic) {
        fs.unlink(`${__dirname}/../uploads/${profilePic.filename}`, function (err) {
            if (err) throw err;
            console.log('File deleted!');
        });

        const deletedProfilePic = await prismaClient.profilePic.delete({
            where: {
                userId: +req.user.id
            }
        })
    }

    //existing file and new req file   ---> chalo
    //no existing file and  new req file --->  chalo
    //existing file and no new req file ---> mat chalo
    //no existing file and no new req file ---> mat chalo


    ((req.file && !profilePic) || (req.file && profilePic)) && await prismaClient.profilePic.create({
        data: {
            id: req.file.filename.split(".")[0],
            path: req.file.path,
            filename: req.file.filename,
            userId: +req.user.id
        }
    })


    if (req.body) {

        const user = await prismaClient.user.update({
            where: {
                id: +req.user.id
            }, data: {
                role: req.body.role
            }
        });
    }

    res.status(200).json({
        message: "Updated user successfully."
    });
}


const getUser = async (req, res, next) => {

    res.json({
        message: "this is user detail",
        user: req.user
    })
}


module.exports = { getAllUsers, deleteUser, getUserById, updateUserById, updateUser, getUser }



