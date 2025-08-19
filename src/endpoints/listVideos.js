import express from 'express';
import { listVideos } from '../functions/mongodb.js';
const router = express.Router();
// GET /api/videos
router.get('/api/videos', async (req, res) => {
    try {
        const videos = await listVideos(100);
        res.json({ videos });
    } catch (err) {
        console.error('[LIST VIDEOS] Error:', err);
        res.status(500).json({ error: 'Failed to fetch videos.' });
    }
});
export default router;
