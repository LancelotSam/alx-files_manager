import { MongoClient } from 'mongodb';

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${host}:${port}/`;

class DBClient {
  constructor() {
    this.db = null;
    this.client = null;

    this.connect();
  }

  async connect() {
    try {
      this.client = await MongoClient.connect(url, { useUnifiedTopology: true });
      this.db = this.client.db(database);
      await this.db.createCollection('users');
      await this.db.createCollection('files');
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB Connection Error:', error);
    }
  }

  isAlive() {
    return !!this.db;
  }

  async nbUsers() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db.collection('users').countDocuments();
  }

  async getUser(query) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    console.log('QUERY IN DB.JS', query);
    const user = await this.db.collection('users').findOne(query);
    console.log('GET USER IN DB.JS', user);
    return user;
  }

  async nbFiles() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db.collection('files').countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
