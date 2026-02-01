const { Transform } = require('stream');

class ChunkerStream extends Transform {
    constructor() {
        super({ objectMode: true });
        this.buffer = Buffer.alloc(0);
        this.CHUNK_SIZE = 1024 * 1024;
    }

    _transform(chunk, encoding, callback) {
        this.buffer = Buffer.concat([this.buffer, chunk]);

        while (this.buffer.length >= this.CHUNK_SIZE) {
            const chunkData = this.buffer.slice(0, this.CHUNK_SIZE);
            this.buffer = this.buffer.slice(this.CHUNK_SIZE);

            this.push(chunkData);
        }

        callback();
    }

    _flush(callback) {
        if (this.buffer.length > 0) {
            this.push(this.buffer);
        }
        callback();
    }
}

module.exports = ChunkerStream;
