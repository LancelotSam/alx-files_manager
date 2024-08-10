/**
 * Authenticate a user
 */
import { v4 as uuidv4 } from 'uuid'; // For generating unique tokens
import hash from '../utils/hash'; // Utility to hash passwords
import dbClient from '../utils/db'; // Database client
import redisClient from '../utils/redis'; // Redis client

const getConnect = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

    const [type, credentials] = authHeader.split(' ');
    if (type !== 'Basic' || !credentials) return res.status(401).json({ error: 'Unauthorized' });

    const [email, password] = Buffer.from(credentials, 'base64').toString().split(':');
    if (!email || !password) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const hashedPassword = hash(password);
        const user = await dbClient.getUser({ email, password: hashedPassword });

        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const token = uuidv4();
        const result = await redisClient.set(`auth_${token}`, user._id.toString(), 'EX', 86400); 

        return res.status(200).json({ token });
    } catch (error) {
        console.error('Error during connect:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const getDisconnect = async (req, res) => {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const result = await redisClient.del(`auth_${token}`);
        if (result === 0) return res.status(401).json({ error: 'Unauthorized' });

        return res.status(204).send();
    } catch (error) {
        console.error('Error during disconnect:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export { getConnect, getDisconnect };
