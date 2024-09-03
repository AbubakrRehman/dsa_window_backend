const express = require('express');
const router = express.Router();

const { signup, login, me, forgetPassword, resetPassword, verifyToken, emailPasswordResetLink, verifyPasswordResetToken } = require('../controllers/auth');
const handleError = require('../controllers/handleError');
const authMiddleware = require('../middlewares/authMiddleware');


//signup logic
router.post("/signup",handleError(signup))


//login logic
router.post("/login", handleError(login))

router.post("/email-password-reset-link", handleError(emailPasswordResetLink))

router.get("/verify-token/:token", handleError(verifyPasswordResetToken))

router.post("/reset-password", handleError(resetPassword))

router.get("/me", [authMiddleware],handleError(me))




module.exports = router;