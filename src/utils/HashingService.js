const crypto = require('crypto');

class HashingService {
    static compute(buffer) {
        return crypto.createHash('sha256').update(buffer).digest('hex');
    }
}

module.exports = HashingService;
