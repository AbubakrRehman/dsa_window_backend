const express = require('express');
const router = express.Router();

const { signup, login, me, forgetPassword, resetPassword, verifyToken } = require('../controllers/auth');
const handleError = require('../controllers/handleError');
const authMiddleware = require('../middlewares/authMiddleware');


//signup logic
router.post("/signup",handleError(signup))


//login logic
router.post("/login", handleError(login))

// router.get("/forget-password", handleError(getForgetPasswordPage))

router.post("/forget-password", handleError(forgetPassword))

router.get("/verify-token/:token", handleError(verifyToken))

router.post("/reset-password", handleError(resetPassword))



router.get("/me", [authMiddleware],handleError(me))




module.exports = router;