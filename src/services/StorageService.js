const fs = require('fs-extra');
const path = require('path');

const NODES = [
    path.resolve('./nodes/node1'),
    path.resolve('./nodes/node2'),
    path.resolve('./nodes/node3')
];

class StorageService {
    static async writeChunk(hash, data) {
        for (const node of NODES) {
            const filePath = path.join(node, hash);
            if (await fs.pathExists(filePath)) {
                return [node];
            }
        }

        const targetNode = NODES[Math.floor(Math.random() * NODES.length)];
        const targetPath = path.join(targetNode, hash);

        await fs.writeFile(targetPath, data);
        return [targetNode];
    }

    static async readChunk(hash, nodePaths) {
        for (const node of nodePaths) {
            const fullPath = path.join(node, hash);
            if (await fs.pathExists(fullPath)) {
                return await fs.readFile(fullPath);
            }
        }
        throw new Error(`Chunk ${hash} not found on provided nodes.`);
    }
}

module.exports = StorageService;
