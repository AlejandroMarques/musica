const Song = require('../models/Song')
const {saveDocument,findByIdAndPopulate, findDocumentsAndPopulate, findDocumentById, findDocuments, updateDocument, deleteDocuments, uploadDocument} = require('../helpers/mongoose')
const {media} = require('../helpers/general')
const test = (req, res) => {
  return res.status(200).json({
    status: 'Success',
    message: 'Song test!'
  })
}

const save = async (req, res) => {
  try{
    const song = new Song(req.body)
    const result = await saveDocument(song)
    return res.status(200).json(result);
  }
  catch(error){
    return res.status(500).json(error)
  }
}

const song = async (req, res) => {
  try {
    if(!req.params.id) return res.status(400).json({ status: "error", message: "Missing id parameter" })
    const {song} = await findByIdAndPopulate(Song, req.params.id, {}, 'album')
    return res.status(200).json({ status: "success", song });
  } catch (error) {
    return res.status(500).json(error);
  }
}

const list = async (req, res) => {
  try {
    const options = {
      ...req.body,
      filter: {$or:[{ album: req.params.id }]},
      populate:{path: 'album', populate: {path: 'artist'}}
    }
    const result = await findDocumentsAndPopulate(Song, options)
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json(error);
  }
}

const update = async (req, res) => {
  if(!req.params.id) return res.status(400).json({ status: "error", message: "Missing id parameter" })
  const data = req.body
  try {
    if(Object.keys(data).length === 0) return res.status(200).json({ status: "ok", message: "Nothing to update" })
    const docUpdated = await updateDocument(Song, req.params.id, data)
    return res.status(200).json({status: 'success', message : 'Song updated!', song: docUpdated});
  }
  catch(error){
    return res.status(500).json(error)
  }
}

const remove = async (req, res) => {
  try {
    if(!req.params.id) return res.status(500).send({status: 'error', message: 'Id is required'});
    const id = req.params.id;
    const song = await deleteDocuments(Song, {_id: id})
    return res.status(200).json({status: 'success', message: 'Song deleted!', song});
  } catch (error) {
    return res.status(500).json(error);
  }
}

const upload = async (req, res) => {
  try {
    if(!req.params.id) return res.status(400).json({ status: "error", message: "Missing id parameter" })
    const result = await uploadDocument(Song, {_id: req.params.id}, {file: req.file.filename}, req.file, ['mp3', 'wav', 'ogg'])
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json(error);
    
  }
}

const audio = async (req, res) => {
  const result = await media(req.params.file, './uploads/songs', 'file').catch((err) => {
    return res.status(500).json(err);
  });
  res.sendFile(result);
}

module.exports = {
  test,
  save,
  song,
  list,
  update,
  remove,
  upload,
  audio
}