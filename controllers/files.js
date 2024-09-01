
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const AlreadyExistException = require('../exceptions/alreadyExist');
const ErrorCode = require('../exceptions/errorCode');

const prismaClient = new PrismaClient({
    // log: ['query']
})


const downloadFile = async (req, res, next) => {

    let profilePic = await prismaClient.profilePic.findFirst({
        where: { id: req.params.id }
    })

    if (!profilePic) {
        next(new AlreadyExistException("Profile Pic Not Found!!!", ErrorCode.PROFILE_PIC_NOT_FOUND))
    }

    const profilePicFile = `${__dirname}/../uploads/${profilePic.filename}`;
    return res.download(profilePicFile)
}


module.exports = { downloadFile }



