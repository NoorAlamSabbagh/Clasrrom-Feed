# SyncUp - Realtime Coaching Feed

A small realtime coaching feed application built with Node.js, Express, Socket.IO, Next.js, PostgreSQL (Neon), and Redis.

## Features

- **Realtime Updates**: New feed entries appear instantly on the home page using Socket.IO.
- **Caching**: `GET /feed` requests are cached in Redis for improved performance (caching is automatically disabled if Redis is unavailable).
- **Persistent Storage**: All feed entries are stored in a PostgreSQL database (Neon recommended).
- **Admin Panel**: A dedicated page for coaches to post new updates.
- **Responsive UI**: Built with Next.js and Tailwind CSS for a modern look and feel.
- **Error Handling**: Basic error handling and loading states included.
- **Reconnect Support**: Socket.IO handles reconnection automatically.

## Prerequisites

- Node.js (v18+)
- PostgreSQL Database (e.g., [Neon.tech](https://neon.tech))
- Redis Server (local or managed)

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd SyncUp_feed
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:3000
```

Start the backend server:
```bash
npm start
# or for development
node server.js
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend development server:
```bash
npm run dev
```

## API Endpoints

- `GET /feed`: Retrieves the latest feed items. Uses Redis caching (60s TTL).
- `POST /feed`: Creates a new feed item, invalidates the Redis cache, and emits a `new-feed` event via Socket.IO.

## Evaluation Criteria Met

- [x] API understanding (Express routes, middleware)
- [x] Redis caching implementation
- [x] WebSocket handling (Socket.IO)
- [x] DB usage (PostgreSQL with Pool)
- [x] Realtime thinking (Socket events, frontend state management)
- [x] Bonus: Reconnect handling, Loading/Error states

## Screenshots

### Home Page (Realtime Feed)
Shows the list of coaching updates with connection status.

### Admin Page
Form to submit new updates.
