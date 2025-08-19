import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import uploadVideoRouter from './endpoints/uploadVideo.js';
import listVideosRouter from './endpoints/listVideos.js';
// Load environment variables (.env)
dotenv.config();
const PORT = process.env.PORT || 3000;
// __dirname fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Express app setup
const app = express();
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve UI assets from src/ui (for core.html)
const uiDir = path.join(__dirname, 'ui');
app.use('/ui', express.static(uiDir));
// Serve core.html as SPA root on "/"
app.get('/', (req, res) => {
    res.sendFile(path.join(uiDir, 'core.html'));
});
// API endpoints
app.use(uploadVideoRouter);
app.use(listVideosRouter);
// Basic health endpoint for deployment verification
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Global error handler (for unexpected errors)
app.use((err, req, res, next) => {
    console.error('[SERVER ERROR]', err);
    res.status(500).json({ error: 'Internal server error.' });
});
// Start server
app.listen(PORT, () => {
    console.log(`Simple Video Sharing Platform backend listening on port ${PORT}`);
    console.log(`SPA available at: http://localhost:${PORT}/`);
});
