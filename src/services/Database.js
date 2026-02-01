const mongoose = require('mongoose');
const Redis = require('ioredis');
require('dotenv').config();

let redisClient;

try {
  redisClient = new Redis(process.env.REDIS_URI || 'redis://localhost:6379', {
    retryStrategy: () => null,
    maxRetriesPerRequest: 1
  });

  redisClient.on('error', (err) => {
    if (redisClient.status !== 'end') {
      console.warn("Redis connection failed. Using in-memory fallback.");
    }
    redisClient = {
      data: new Map(),
      get: async (key) => redisClient.data.get(key),
      set: async (key, val) => redisClient.data.set(key, val),
      del: async (key) => redisClient.data.delete(key),
      quit: async () => { },
      duplicate: () => redisClient,
      status: 'ready'
    };
  });
} catch (e) {
  console.log("Redis Init Error", e);
}

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mini-s3';
    await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB at ${mongoURI}`);

    if (redisClient && redisClient.set) {
      await redisClient.set('ping', 'pong');
      console.log(`Connected to Redis`);
    }
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectDB, redisClient };
