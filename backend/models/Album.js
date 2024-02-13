const {model, Schema} = require('mongoose');

const AlbumSchema = Schema({
  title: {type: String, required: true},
  description: String,
  year: Number,
  image: {type: String, default: 'default.png'},
  artist: {type: Schema.ObjectId, ref: 'Artist'},
  created_at: {type: Date, default: Date.now}
})

module.exports = model('Album', AlbumSchema, 'albums');