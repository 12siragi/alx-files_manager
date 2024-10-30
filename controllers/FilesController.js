// controllers/FilesController.js
const { v4: uuidv4 } = require('uuid');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const fs = require('fs');
const path = require('path');

class FilesController {
  static async postUpload(req, res) {
    const userId = await redisClient.get(`auth_${req.headers['x-token']}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, type, parentId = 0, isPublic = false, data } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!['file', 'image', 'folder'].includes(type)) return res.status(400).json({ error: 'Missing type' });
    if (type !== 'folder' && !data) return res.status(400).json({ error: 'Missing data' });
    
    const fileId = uuidv4();
    const filePath = path.join(process.env.FOLDER_PATH || '/tmp/files_manager', fileId);

    if (type !== 'folder') {
      fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
    }

    const file = await dbClient.createFile({ name, type, userId, parentId, isPublic, localPath: filePath });
    res.status(201).json(file);
  }
}

module.exports = FilesController;

