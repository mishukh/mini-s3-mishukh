const mongoose = require('mongoose');
const { Schema } = mongoose;

const ChunkSchema = new Schema({
  hash: { type: String, required: true, unique: true },
  size: { type: Number, required: true },
  nodes: { type: [String], required: true },
  createdAt: { type: Date, default: Date.now }
});

const FileSchema = new Schema({
  filename: { type: String, required: true },
  size: { type: Number, required: true },
  chunks: { type: [String], ref: 'Chunk', required: true },
  createdAt: { type: Date, default: Date.now }
});

const ChunkModel = mongoose.model('Chunk', ChunkSchema);
const FileModel = mongoose.model('File', FileSchema);

module.exports = { ChunkModel, FileModel };
