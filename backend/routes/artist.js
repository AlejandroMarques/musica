const express = require("express");
const router = express.Router();
const {auth} = require('../middleware/auth');

const controller = require("../controllers/artist");
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.resolve(__dirname, '../uploads/artists')),
  filename: (req, file, cb) => cb(null, `artist-${Date.now()}-${file.originalname}`)
})

const uploads = multer({storage});

router.get('/test', controller.test)
router.get('/save', [auth], controller.save)
router.get('/profile/:id', [auth], controller.profile)
router.get('/list', [auth], controller.list)
router.put('/update/:id', [auth], controller.update)
router.delete('/remove/:id', [auth], controller.remove)
router.post('/upload/:id', [auth, uploads.single('file')], controller.upload)
router.get('/image/:file', [auth], controller.image)

module.exports = router;