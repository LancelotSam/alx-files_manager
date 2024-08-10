/* eslint-disable no-unused-vars */
import { MongoClient, ObjectId } from 'mongodb';

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
      await this.createCollectionIfNotExists('users');
      await this.createCollectionIfNotExists('files');
      await this.createUniqueIndex('users', { email: 1 });
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB Connection Error:', error);
    }
  }

  async createCollectionIfNotExists(collectionName) {
    try {
      const collections = await this.db.listCollections({ name: collectionName }).toArray();
      if (collections.length === 0) {
        await this.db.createCollection(collectionName);
        console.log(`Collection ${collectionName} created.`);
      } else {
        console.log(`Collection ${collectionName} already exists.`);
      }
    } catch (error) {
      console.error(`Error creating collection ${collectionName}:`, error);
    }
  }

  async createUniqueIndex(collectionName, index) {
    try {
      await this.db.collection(collectionName).createIndex(index, { unique: true });
      console.log(`Unique index created on ${collectionName}.`);
    } catch (error) {
      console.error(`Error creating unique index on ${collectionName}:`, error);
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

  async insertOne(collectionName, document) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const collection = this.db.collection(collectionName);
    return collection.insertOne(document);
  }
}

const dbClient = new DBClient();
export { dbClient, ObjectId };
