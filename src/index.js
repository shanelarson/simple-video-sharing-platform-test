import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import uploadRouter from './endpoints/upload.js';
import videosRouter from './endpoints/videos.js';
import { connectMongo } from './classes/mongo.js';
// Load env vars
dotenv.config();
const PORT = process.env.PORT || 4000;
const app = express();
// Setup __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Connect MongoDB on startup
(async function initMongo() {
  try {
    await connectMongo();
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
})();
// Serve SPA at /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'ui', 'core.html'));
});
// Serve static assets (if needed) from /src/ui
app.use('/ui', express.static(path.join(__dirname, 'ui')));
// API endpoints
app.use(uploadRouter);
app.use(videosRouter);
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
// Basic error handler
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ error: 'Internal server error' });
});
app.listen(PORT, () => {
  console.log(`Simple Video Sharing Platform listening on port ${PORT}`);
});
