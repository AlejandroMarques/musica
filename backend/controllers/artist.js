const Artist = require('../models/Artist')
const Album = require('../models/Album')
const Song = require('../models/Song')
const {saveDocument, findDocumentById, findDocuments, updateDocument,  deleteDocuments, uploadDocument} = require('../helpers/mongoose')
const {media} = require('../helpers/general')
const test = (req, res) => {
  return res.status(200).json({
    status: 'Success',
    message: 'Artist test!'
  })
}

const save = async (req, res) => {
  try{
    const artist = new Artist(req.body)
    const result = await saveDocument(artist)
    return res.status(200).json(result);
  }
  catch(error){
    return res.status(500).json(error)
  }
}

const profile = async (req, res) => {
  try {
    const {artist} = await findDocumentById(Artist, req.params.id)
    return res.status(200).json({ status: "success", artist });
  } catch (error) {
    return res.status(500).json(error);
  }
}

const list = async (req, res) => { 
  try {
    const result = await findDocuments(Artist, req.body)
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json(error)
  }

}

const update = async (req, res) => {
  try {
    if(!req.params.id) return res.status(400).json({ status: "error", message: "Missing id parameter" })
    if(Object.keys(req.body).length === 0) return res.status(400).json({ status: "error", message: "Nothing to update" })
    const result = await updateDocument(Artist, req.params.id, req.body)
    return res.status(200).json({status: 'success', message : 'Artist updated!', result});
  } catch (error) {
    return res.status(500).json(error);
  }
}

const remove = async (req, res) => {
  try {
    if(!req.params.id) return res.status(500).send({status: 'error', message: 'Id is required'});
    const id = req.params.id;
    const artist = await deleteDocuments(Artist, {_id: id})
    const {albums} = await findDocuments(Album, {filter:{artist: id}, itemsPerPage: 0})
    let songs = []
    let deletedAlbums = []
    for (const album of albums) {
      songs = songs.concat(await deleteDocuments(Song, {album: album._id}))
      deletedAlbums = await deleteDocuments(Album, {_id: album._id})
    }
    return res.status(200).send({status: 'success', message : 'Artist deleted!', artist, albums, songs});
  } catch (error) {
    return res.status(500).send(error);
  }
}

const upload = async (req, res) => {
  try {
    if(!req.params.id) return res.status(400).json({ status: "error", message: "Missing id parameter" })
    const result = await uploadDocument(Artist, {_id: req.params.id}, {image: req.file.filename}, req.file, ['png', 'jpg', 'jpeg', 'gif'])
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json(error);
    
  }
}

const image = async (req, res) => {
  const result = await media(req.params.file, './uploads/artists').catch((err) => {
    return res.status(500).json(err);
  });
  res.sendFile(result);
}

module.exports = {
  test, 
  save,
  profile,
  list,
  update,
  remove,
  upload,
  image
}