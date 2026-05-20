const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('./db');
const redisClient = require('./redis');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Initialize Database Table
const initDb = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS feeds (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        author TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database initialized");
  } catch (err) {
    console.error("Error initializing database:", err);
  }
};
initDb();

// GET /feed
app.get('/feed', async (req, res) => {
  try {
    // Try to get from Redis first if connected
    if (redisClient.isConnected()) {
      try {
        const cachedFeeds = await redisClient.get('feeds');
        if (cachedFeeds) {
          console.log('Serving from cache');
          return res.json(JSON.parse(cachedFeeds));
        }
      } catch (redisErr) {
        console.error('Redis GET error:', redisErr);
        // Continue to DB if Redis fails
      }
    }

    // If not in cache or Redis down, get from DB
    const result = await db.query('SELECT * FROM feeds ORDER BY created_at DESC LIMIT 50');
    const feeds = result.rows;

    // Store in Redis for 60 seconds if connected
    if (redisClient.isConnected()) {
      try {
        await redisClient.setEx('feeds', 60, JSON.stringify(feeds));
      } catch (redisErr) {
        console.error('Redis SET error:', redisErr);
      }
    }
    
    console.log('Serving from DB');
    res.json(feeds);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /feed
app.post('/feed', async (req, res) => {
  const { content, author } = req.body;
  if (!content || !author || content.trim() === '' || author.trim() === '') {
    return res.status(400).json({ error: 'Content and author are required and cannot be empty' });
  }

  try {
    const result = await db.query(
      'INSERT INTO feeds (content, author) VALUES ($1, $2) RETURNING *',
      [content.trim(), author.trim()]
    );
    const newFeed = result.rows[0];

    // Invalidate Redis cache if connected
    if (redisClient.isConnected()) {
      try {
        await redisClient.del('feeds');
      } catch (redisErr) {
        console.error('Redis DEL error:', redisErr);
      }
    }

    // Emit realtime update to all connected clients
    io.emit('new-feed', newFeed);

    res.status(201).json(newFeed);
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
