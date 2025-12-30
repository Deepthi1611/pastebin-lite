# Pastebin Lite

A minimal Pastebin-like application that allows users to create text pastes and share a URL to view them.
Pastes can optionally expire based on time-to-live (TTL) or a maximum number of views.

## Running the project locally

### Prerequisites
- Node.js (v18 or later)
- Redis

### Steps

1. Install dependencies
   npm install

2. Start Redis
   redis-server

3. Start the application
   npm run dev

The server will start on http://localhost:3000

## Persistence layer

This project uses Redis as the persistence layer.  
Redis is used to store paste content, creation time, view counts, and optional expiry constraints so that data persists across requests and server restarts.