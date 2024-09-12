const express = require('express');
const router = express.Router();

const { signup, login, me, forgetPassword, resetPassword, verifyToken, emailPasswordResetLink, verifyPasswordResetToken, verifyEmail } = require('../controllers/auth');
const handleError = require('../controllers/handleError');
const authMiddleware = require('../middlewares/authMiddleware');


router.post("/signup",handleError(signup))

router.post("/login", handleError(login))

router.post("/email-password-reset-link", handleError(emailPasswordResetLink))

router.post("/verify-password-reset-token", handleError(verifyPasswordResetToken))

router.post("/reset-password", handleError(resetPassword))

router.get("/verify-email/:token", handleError(verifyEmail))

router.get("/me", [authMiddleware],handleError(me))

module.exports = router;