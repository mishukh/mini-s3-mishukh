const express = require('express');
const router = express.Router();
const FileController = require('../controllers/FileController');

router.post('/upload', FileController.uploadFile);
router.get('/files/:id', FileController.downloadFile);
router.get('/files', FileController.listFiles);

module.exports = router;
