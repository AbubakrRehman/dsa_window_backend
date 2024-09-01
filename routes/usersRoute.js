const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const handleError = require('../controllers/handleError');
const multer  = require('multer');
const { v4: uuidv4 } = require('uuid');
const path= require('path');
const { updateUser, getAllUsers, deleteUser, getUserById, updateUserById, getUser } = require('../controllers/users');
const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      const fileName = uuidv4();
      const fileExtension = path.extname(file.originalname);
      const fullFileName = `${fileName}${fileExtension}`;
      cb(null, fullFileName)
    }
  })

const upload = multer({ storage: storage })

router.get("/user", [authMiddleware], handleError(getUser))

router.get("/", handleError(getAllUsers))

router.put("/", [authMiddleware, upload.single('avatar')], handleError(updateUser))

router.delete("/:userId", handleError(deleteUser))

router.get("/:userId", handleError(getUserById))

router.put("/:userId", [authMiddleware, upload.single('avatar')],handleError(updateUserById))


// router.put("/",[authMiddleware],handleError(updateUser))

module.exports = router;