import Queue from 'bull';
import hash from '../utils/hash';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const postNew = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Missing email' });
  if (!password) return res.status(400).json({ error: 'Missing password' });

  try {
    const hashedPassword = hash(password);
    const result = await dbClient.insertOne('users', { email, password: hashedPassword });

    const userQueue = new Queue('userQueue');
    userQueue.on('global:completed', async (jobId) => {
      try {
        const job = await userQueue.getJob(jobId);
        console.log(`Welcome email has been sent to user ${job.data.userId}`);
        await job.remove();
      } catch (err) {
        console.error(`Error handling job ${jobId}:`, err);
      }
    });

    await userQueue.add({ userId: result.insertedId });

    return res.status(201).json({ id: result.insertedId, email });
  } catch (error) {
	  console.error('Error creating user:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Already exist' });
    }
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getMe = async (req, res) => {
  try {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (userId) {
      const user = await dbClient.findOne('users', { _id: ObjectId(userId) });
      if (user) {
        return res.status(200).json({ id: user._id, email: user.email });
      }
    }
    return res.status(401).json({ error: 'Unauthorized' });
  } catch (error) {
    console.error('Error in getMe:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { postNew, getMe };
