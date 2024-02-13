const Album = require('../models/Album')
const {saveDocument, findDocumentById, findDocuments, updateDocument, deleteDocument, deleteDocuments, uploadDocument, findByIdAndPopulate, findDocumentsAndPopulate} = require('../helpers/mongoose')
const {media} = require('../helpers/general')

const test = (req, res) => {
  return res.status(200).json({
    status: 'Success',
    message: 'Album test!'
  })
}

const save = async (req, res) => {
  try{
    const album = new Album(req.body)
    const result = await saveDocument(album)
    return res.status(200).json(result);
  }
  catch(error){
    return res.status(500).json(error)
  }
}

const album = async (req, res) => {
  try {
    if(!req.params.id) return res.status(400).json({ status: "error", message: "Missing id parameter" })
    const {album} = await findByIdAndPopulate(Album, req.params.id, {}, 'artist')
    return res.status(200).json({ status: "success", album });
  } catch (error) {
    return res.status(500).json(error);
  }
}

const list = async (req, res) => {
  try {
    const options = {
      ...req.body,
      filter: {$or:[{ artist: req.params.id }]},
      populate: 'artist'
    }
    const result = await findDocumentsAndPopulate(Album, options)
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json(error);
  }
}

const update = async (req, res) => {
  if(!req.params.albumId) return res.status(400).json({ status: "error", message: "Missing albumId parameter" })
  const data = req.body
  try {
    if(Object.keys(data).length === 0) return res.status(200).json({ status: "error", message: "Nothing to update" })
    const docUpdated = await updateDocument(Album, req.params.albumId, data)
    return res.status(200).json({status: 'success', message : 'Album updated!', album: docUpdated, data});
  }
  catch(error){
    return res.status(500).json(error)
  }
}

const upload = async (req, res) => {
  try {
    if(!req.params.id) return res.status(400).json({ status: "error", message: "Missing id parameter" })
    const result = await uploadDocument(Album, {_id: req.params.id}, {image: req.file.filename}, req.file, ['png', 'jpg', 'jpeg', 'gif'])
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json(error);
    
  }
}

const image = async (req, res) => {
  const result = await media(req.params.file, './uploads/albums').catch((err) => {
    return res.status(500).json(err);
  });
  res.sendFile(result);
}

module.exports = {
  test,
  save,
  album,
  list,
  update,
  upload,
  image
}