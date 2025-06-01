
const jwt = require('jsonwebtoken');
const { PrismaClient, Prisma } = require('@prisma/client');
const ErrorCode = require('../exceptions/errorCode');
const { json } = require('../utils');
const { search } = require('../routes/topicsRoute');
const UnauthorizedException = require('../exceptions/unauthorized');

const prismaClient = new PrismaClient({
    // log: ['query']
})


const getAllUserTopics = async (req, res, next) => {
    const userId = +req.user.id;

    // Fetch all topics with their questions and user status
    const topics = await prismaClient.topic.findMany({
        include: {
            questions: {
                include: {
                    users: {
                        where: { userId },
                        select: { isCompleted: true }
                    }
                }
            }
        }
    });

    // Post-process to calculate counts
    const result = topics.map(topic => {
        const totalQuestions = topic.questions.length;
        const completedQuestions = topic.questions.filter(
            q => q.users.some(u => u.isCompleted)
        ).length;

        return {
            id: topic.id,
            title: topic.title,
            totalQuestions,
            completedQuestions
        };
    });
    return res.json(result)
}

const getAllTopics = async (req, res, next) => {

    let topics = await prismaClient.topic.findMany({
        include: {
            _count: {
                include: {
                    questions: true
                }
            }
        }
    });

    res.json(topics)
}


const getQuestionsByTopicId = async (req, res, next) => {

    let questions;

    questions = await prismaClient.question.findMany({
        where: {
            topicId: req.params.id
        }
    });

    res.json(questions)
}


const getUserQuestionsByTopicId = async (req, res, next) => {

    let userDetails;

    userDetails = await prismaClient.user.findFirst({
        where: {
            id: +req.user.id
        }, include: {
            questions: true
        }
    });

    res.json(userDetails)
}


const addTopic = async (req, res, next) => {

    const id = crypto.randomUUID();

    let topic = await prismaClient.topic.create({
        data: {
            id: id,
            title: req.body.title
        }
    });

    res.json(topic)
}


const addQuestionToTopic = async (req, res, next) => {

    let question = await prismaClient.question.create({
        data: {
            title: req.body.title,
            topicId: req.params.id
        }
    });

    res.json(question)
}


const deleteTopic = async (req, res, next) => {

    if (req.user.role !== 'ADMIN') {
        next(new UnauthorizedException("User not authorized", ErrorCode.UNAUTHARIZED))
    }

    let topic = await prismaClient.topic.delete({
        where: {
            id: req.params.id
        }
    });

    res.json(topic)
}

const deleteQuestion = async (req, res, next) => {

    // logged in user has the role of admin or not
    //fetach details of users from database n check the role
    //if above sucessful then onlty perform below

    try {
        let question = await prismaClient.question.delete({
            where: {
                id: +req.params.questionId,
                topicId: req.params.topicId
            }
        });

        res.json(question)
    }
    catch (err) {
        console.log("err", err);
    }
}


const attemptQuestion = async (req, res, next) => {

    try {
        await prismaClient.questionEvent.upsert({
            where: {
                userId_questionId_topicId: {
                    questionId: +req.params.questionId,
                    userId: +req.user.id,
                    topicId: req.params.topicId
                }
            },
            create: {
                questionId: +req.params.questionId,
                userId: +req.user.id,
                topicId: req.params.topicId,
                note: req.body.note ? req.body.note : '',
                isBookmarked: req.body.isBookmarked ? true : false,
                isCompleted: req.body.isCompleted ? true : false
            },
            update: req.body
        });

        return res.json({
            message: "Question attempt updated successfully"
        });
    } catch (error) {
        console.log("Error updating question attempt:", error);
    }
}


const getUserQuestionsByTopicIdWithStatus = async (req, res, next) => {

    let { isBookmarked, isCompleted, search, sortBy } = req.query;
    let order = sortBy.substring(0, 1);
    sortBy = sortBy.substring(1,);

    const userId = +req.user.id;
    const questionsWithAttemptStatus = await prismaClient.question.findMany({
        where: {
            topicId: req.params.id,
        },
        include: {
            users: {
                where: { userId },
                select: {
                    note: true,
                    isCompleted: true,
                    isBookmarked: true,
                    updatedAt: true,
                    createdAt: true
                }
            }
        }
    });


    let result = questionsWithAttemptStatus.map(q => ({
        id: +q.id,
        title: q.title,
        note: q.users[0]?.note ?? "",
        isCompleted: q.users[0]?.isCompleted ?? false,
        isBookmarked: q.users[0]?.isBookmarked ?? false,
        updatedAt: q.users[0]?.updatedAt ?? null,
        createdAt: q.users[0]?.createdAt ?? null,
    }));

    if (search && search != '') {
        result = result.filter((item) => item.title.trim().toLowerCase().includes(search.trim().toLowerCase()))
    }

    if (isBookmarked && !isCompleted) {
        result = result.filter((item) => item.isBookmarked)
    }

    if (!isBookmarked && isCompleted) {
        result = result.filter((item) => item.isCompleted)
    }

    if (isBookmarked && isCompleted) {
        result = result.filter((item) => item.isCompleted && item.isBookmarked)
    }

    if ((sortBy == 'updatedAt' || sortBy == 'createdAt')) {

        if (order == '-') {
            result.sort((a, b) => {
                if (new Date(a[`${sortBy}`]) > new Date(b[`${sortBy}`])) return -1;
                if (new Date(a[`${sortBy}`]) < new Date(b[`${sortBy}`])) return 1;
                if (new Date(a[`${sortBy}`]) == new Date(b[`${sortBy}`])) return 0;
            })
        } else {
            result.sort((a, b) => {
                if (new Date(a[`${sortBy}`]) > new Date(b[`${sortBy}`])) return 1;
                if (new Date(a[`${sortBy}`]) < new Date(b[`${sortBy}`])) return -1;
                if (new Date(a[`${sortBy}`]) == new Date(b[`${sortBy}`])) return 0;
            })
        }
    } else {
        if (order == '-') {
            result.sort((a, b) => {
                if (a[`${sortBy}`].trim().toLowerCase() > b[`${sortBy}`].trim().toLowerCase()) return -1;
                if (a[`${sortBy}`].trim().toLowerCase() < b[`${sortBy}`].trim().toLowerCase()) return 1;
                if (a[`${sortBy}`].trim().toLowerCase() == b[`${sortBy}`].trim().toLowerCase()) return 0;
            })
        } else {
            result.sort((a, b) => {
                if (a[`${sortBy}`].trim().toLowerCase() > b[`${sortBy}`].trim().toLowerCase()) return 1;
                if (a[`${sortBy}`].trim().toLowerCase() < b[`${sortBy}`].trim().toLowerCase()) return -1;
                if (a[`${sortBy}`].trim().toLowerCase() == b[`${sortBy}`].trim().toLowerCase()) return 0;
            })
        }
    }

    return res.json(result)
}

const updateTopic = async (req, res, next) => {

    const topic = await prismaClient.topic.update({
        where: {
            id: req.params.id
        }, data: {
            title: req.body.title
        }
    })

    res.json(topic)
}


module.exports = {
    getAllUserTopics,
    getAllTopics,
    getQuestionsByTopicId,
    addTopic,
    addQuestionToTopic,
    getUserQuestionsByTopicId,
    deleteQuestion,
    deleteTopic,
    attemptQuestion,
    getUserQuestionsByTopicIdWithStatus,
    updateTopic
}




