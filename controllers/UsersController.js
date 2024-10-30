// controllers/UsersController.js
const sha1 = require('sha1');
const dbClient = require('../utils/db');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ error: 'Missing email' });
    if (!password) return res.status(400).json({ error: 'Missing password' });
    
    const user = await dbClient.getUser({ email });
    if (user) return res.status(400).json({ error: 'Already exist' });

    const hashedPassword = sha1(password);
    const newUser = await dbClient.createUser({ email, password: hashedPassword });
    res.status(201).json({ id: newUser._id, email: newUser.email });
  }

  static async getMe(req, res) {
    const userId = await redisClient.get(`auth_${req.headers['x-token']}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const user = await dbClient.getUserById(userId);
    res.json({ id: user._id, email: user.email });
  }
}

module.exports = UsersController;

