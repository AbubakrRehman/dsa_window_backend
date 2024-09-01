const express = require('express');
const handleError = require('../controllers/handleError');
const { downloadFile } = require('../controllers/files');
const router = express.Router();


router.get("/:id", handleError(downloadFile))

module.exports = router;