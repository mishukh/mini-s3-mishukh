const { Writable } = require('stream');
const HashingService = require('../utils/HashingService');
const StorageService = require('../services/StorageService');
const { ChunkModel } = require('../models/Schemas');

class UploadProcessor extends Writable {
    constructor(fileDoc) {
        super({ objectMode: true });
        this.fileDoc = fileDoc;
        this.processedChunks = [];
        this.totalSize = 0;
    }

    async _write(chunk, encoding, callback) {
        try {
            this.totalSize += chunk.length;

            const hash = HashingService.compute(chunk);

            let chunkRecord = await ChunkModel.findOne({ hash });

            if (chunkRecord) {
                return;
            } else {
                const nodes = await StorageService.writeChunk(hash, chunk);

                chunkRecord = await ChunkModel.create({
                    hash: hash,
                    size: chunk.length,
                    nodes: nodes
                });
            }

            this.processedChunks.push(hash);

            callback();
        } catch (err) {
            console.error("Chunk Processing Error:", err);
            callback(err);
        }
    }
}

module.exports = UploadProcessor;
