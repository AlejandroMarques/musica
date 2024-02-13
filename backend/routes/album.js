const express = require("express");
const router = express.Router();
const {auth}  = require("../middleware/auth");
const controller = require("../controllers/album");

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.resolve(__dirname, '../uploads/albums')),
  filename: (req, file, cb) => cb(null, `album-${Date.now()}-${file.originalname}`)
})

const uploads = multer({storage});

router.get('/test', controller.test)
router.get('/save', [auth], controller.save)
router.get('/album/:id', [auth], controller.album)
router.get('/list/:id', [auth], controller.list)
router.put('/update/:albumId', [auth], controller.update)
router.post('/upload/:id', [auth, uploads.single('file')], controller.upload)
router.get('/image/:file', [auth], controller.image)

module.exports = router;