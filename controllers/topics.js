
const jwt = require('jsonwebtoken');
const { PrismaClient, Prisma } = require('@prisma/client');
const ErrorCode = require('../exceptions/errorCode');
const { json } = require('../utils');
const { search } = require('../routes/topicsRoute');

const prismaClient = new PrismaClient({
    // log: ['query']
})


const getAllUserTopics = async (req, res, next) => {

    let topics = await prismaClient.topic.findMany({
        include: {
            _count: {
                include: {
                    questions: true
                }
            }
        }
    });


    let userTopics = await prismaClient.$queryRaw(Prisma.raw(`select COUNT(topicId) as count ,topicId from questions_events where userId = ${+req.user.id} and isCompleted = TRUE group by topicId`))
    userTopics = json(userTopics);

    userTopics = JSON.parse(userTopics);


    let userTopicsMap = userTopics.reduce((acc, curr) => {

        if (curr.topicId)
            return { ...acc, [+curr.topicId]: +curr.count }
        else
            return { ...acc, [+curr.topicId]: 0 }
    }, {})



    resultant = topics.map((topic) => {
        return {
            ...topic, completedCount: userTopicsMap[topic.id] || 0
        }
    })

    res.json(resultant)
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
            topicId: +req.params.id
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

    let topic = await prismaClient.topic.create({
        data: {
            title: req.body.title
        }
    });

    res.json(topic)
}


const addQuestionToTopic = async (req, res, next) => {

    let question = await prismaClient.question.create({
        data: {
            title: req.body.title,
            topicId: +req.params.id
        }
    });

    res.json(question)
}


const deleteTopic = async (req, res, next) => {

    let topic = await prismaClient.topic.delete({
        where: {
            id: +req.params.id
        }
    });

    res.json(topic)
}

const deleteQuestion = async (req, res, next) => {

    try {
        let question = await prismaClient.question.delete({
            where: {
                id: +req.params.questionId,
                topicId: +req.params.topicId
            }
        });

        res.json(question)
    }
    catch (err) {
        console.log("err", err);
    }
}


const attemptQuestion = async (req, res, next) => {

    let question;
    question = await prismaClient.questionEvent.findFirst({
        where: {
            questionId: +req.params.questionId,
            userId: +req.user.id,
            topicId: +req.params.topicId
        }
    })


    let payload = {
        note: req.body.note ? req.body.note : '',
        isBookmarked: req.body.isBookmarked,
        isCompleted: req.body.isCompleted
    }

    if (!question) {
        question = await prismaClient.questionEvent.create({
            data: {
                questionId: +req.params.questionId,
                userId: +req.user.id,
                topicId: +req.params.topicId,
                note: payload.note,
                isBookmarked: payload.isBookmarked,
                isCompleted: payload.isCompleted
            }
        });

        return res.json(question);

    } else {
        question = { ...question, ...req.body };
        const result = await prismaClient.$queryRaw(Prisma.sql`UPDATE questions_events SET note=${question.note}, isBookmarked=${question.isBookmarked}, isCompleted=${question.isCompleted} WHERE questionId = ${+req.params.questionId} AND userId=${+req.user.id} AND topicId=${+req.params.topicId}`);
        return res.json(result);
    }
}


const getUserQuestionsByTopicIdWithStatus = async (req, res, next) => {

    let { isBookmarked, isCompleted, search, sortBy } = req.query;
    let order = sortBy.substring(0, 1);
    sortBy = sortBy.substring(1,);
    console.log("order bhai order", order);

    //questionsList
    let questions = await prismaClient.question.findMany({
        where: {
            topicId: +req.params.id
        }
    })

    //questionsMap
    let questionsMap = questions.reduce((acc, curr) => {
        return { ...acc, [+curr.id]: curr }
    }, {})

    //questionsId
    let questionsId = questions.map((question) => question.id)

    //questionsWithStatusList
    let questionsWithStatus = await prismaClient.questionEvent.findMany({
        where: {
            topicId: +req.params.id,
            userId: +req.user.id
        }
    })

    //questionsWithStatusMap
    let questionsWithStatusMap = questionsWithStatus.reduce((acc, curr) => {
        return { ...acc, [+curr.questionId]: curr }
    }, {})

    //questionsWithStatusId
    let questionsWithStatusId = questionsWithStatus.map((questionWithStatus) => questionWithStatus.questionId)


    let result = [];

    questionsId.forEach((questionId) => {
        if (questionsWithStatusId.includes(questionId)) {
            result.push({
                id: questionId,
                title: questionsMap[questionId].title.trim().toLowerCase(),
                note: questionsWithStatusMap[questionId].note,
                isBookmarked: questionsWithStatusMap[questionId].isBookmarked,
                isCompleted: questionsWithStatusMap[questionId].isCompleted,
                updatedAt: questionsWithStatusMap[questionId].updatedAt,
                createdAt: questionsMap[questionId].createdAt
            })
        } else {
            result.push({
                id: questionId,
                title: questionsMap[questionId].title.trim().toLowerCase(),
                note: "",
                isBookmarked: false,
                isCompleted: false,
                updatedAt: null,
                createdAt: questionsMap[questionId].createdAt
            })
        }
    })

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

    res.json(result)
}

const updateTopic = async (req, res, next) => {

    const topic = await prismaClient.topic.update({
        where: {
            id: +req.params.id
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




