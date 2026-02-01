const Busboy = require('busboy');
const { FileModel, ChunkModel } = require('../models/Schemas');
const ChunkerStream = require('../streams/ChunkerStream');
const UploadProcessor = require('../streams/UploadProcessor');
const StorageService = require('../services/StorageService');
const { Readable } = require('stream');

class FileController {

    static async uploadFile(req, res) {
        const busboy = Busboy({ headers: req.headers });

        busboy.on('file', async (fieldname, file, info) => {
            const { filename } = info;
            console.log(`[Upload] Starting upload for: ${filename}`);

            const fileDoc = new FileModel({
                filename: filename,
                size: 0,
                chunks: []
            });

            const chunker = new ChunkerStream();
            const processor = new UploadProcessor(fileDoc);

            file.pipe(chunker).pipe(processor);

            processor.on('finish', async () => {
                fileDoc.size = processor.totalSize;
                fileDoc.chunks = processor.processedChunks;
                await fileDoc.save();

                console.log(`[Upload] Finished. Size: ${fileDoc.size}, Chunks: ${fileDoc.chunks.length}`);

                if (!res.headersSent) {
                    res.json({ success: true, fileId: fileDoc._id });
                }
            });

            processor.on('error', (err) => {
                console.error("Upload failed", err);
                if (!res.headersSent) res.status(500).json({ error: "Upload failed" });
            });
        });

        req.pipe(busboy);
    }

    static async downloadFile(req, res) {
        try {
            const { id } = req.params;
            const file = await FileModel.findById(id).populate('chunks');

            if (!file) return res.status(404).json({ error: "File not found" });

            // Sanitize filename to prevent header injection
            const safeFilename = file.filename.replace(/"/g, '\\"').replace(/\n/g, '');

            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);

            for (const chunkHash of file.chunks) {
                const chunkMeta = await ChunkModel.findOne({ hash: chunkHash });
                if (!chunkMeta) {
                    console.error(`Chunk missing: ${chunkHash}`);
                    continue;
                }

                const buffer = await StorageService.readChunk(chunkHash, chunkMeta.nodes);

                const ok = res.write(buffer);

                if (!ok) {
                    await new Promise(resolve => res.once('drain', resolve));
                }
            }

            res.end();
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Download failed" });
        }
    }

    static async listFiles(req, res) {
        const files = await FileModel.find().select('-chunks');
        res.json(files);
    }
}

module.exports = FileController;
