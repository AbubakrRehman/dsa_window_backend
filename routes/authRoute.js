const express = require('express');
const router = express.Router();

const { signup, login, me } = require('../controllers/auth');
const handleError = require('../controllers/handleError');
const authMiddleware = require('../middlewares/authMiddleware');


//signup logic
router.post("/signup",handleError(signup))


//login logic
router.post("/login", handleError(login))

router.get("/me", [authMiddleware],handleError(me))


module.exports = router;