const express = require('express');

const authMiddleware = require('../middlewares/authMiddleware');
const handleError = require('../controllers/handleError');
const { getAllTopics, getQuestionsByTopicId, addTopic, addQuestionToTopic, getUserQuestionsByTopicId, deleteTopic, deleteQuestion, attemptQuestion, getUserQuestionsByTopicIdWithStatus, getAllUserTopics, updateTopic } = require('../controllers/topics');
const router = express.Router();

router.delete("/:topicId/questions/:questionId", handleError(deleteQuestion))

router.get("/:id/user_questions", [authMiddleware], handleError(getUserQuestionsByTopicIdWithStatus))

router.put("/:topicId/questions/:questionId", [authMiddleware], handleError(attemptQuestion))

//admin operations corr. to topics
router.get("/admin", handleError(getAllTopics))

router.get("/", [authMiddleware],handleError(getAllUserTopics))

router.post("/",  handleError(addTopic))

// mapp[clinetID] = {user details}

router.delete("/:id",[authMiddleware],  handleError(deleteTopic))

router.put("/:id",  handleError(updateTopic))


//admin operations corr. to questions
router.post("/:id/questions", handleError(addQuestionToTopic))

router.get("/:id/questions", handleError(getQuestionsByTopicId))



// router.get("/:id/questions", [authMiddleware], handleError(getUserQuestionsByTopicId))










// router.post("/", [authMiddleware, adminMiddleware], handleError(createProduct))

// router.get("/:id", handleError(getProductDetail))

// router.put("/:id", [authMiddleware, adminMiddleware], handleError(updateProduct))

// router.delete("/:id", [authMiddleware, adminMiddleware], handleError(deleteProduct))

module.exports = router;