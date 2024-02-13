const express = require("express");
const router = express.Router();
const {auth} = require('../middleware/auth');
const controller = require("../controllers/user");
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.resolve(__dirname, '../uploads/avatars')),
  filename: (req, file, cb) => cb(null, `avatar-${Date.now()}-${file.originalname}`)
})

const uploads = multer({storage});

router.get('/test', controller.test)
router.post('/register', controller.register)
router.post('/login', controller.login)
router.get('/profile/:id', [auth], controller.profile)
router.put('/update', [auth], controller.update)
router.post('/upload', [auth, uploads.single('file')], controller.upload)
router.get('/avatar/:file', [auth], controller.avatar)

module.exports = router;