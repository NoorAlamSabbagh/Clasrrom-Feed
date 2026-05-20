const { createClient } = require('redis');
require('dotenv').config();

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => {
  // Silent error logging to prevent console spam if Redis is down
  // In a real app, you might want to log this to a monitoring service
});

let isRedisConnected = false;

(async () => {
  try {
    await client.connect();
    isRedisConnected = true;
    console.log('Connected to Redis');
  } catch (err) {
    console.log('Redis connection failed - caching disabled');
  }
})();

// Add a helper to check connection status
client.isConnected = () => isRedisConnected;

module.exports = client;
