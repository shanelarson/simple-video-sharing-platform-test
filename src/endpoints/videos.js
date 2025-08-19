import express from 'express';
import { getAllVideos } from '../classes/mongo.js';
const router = express.Router();
// GET /videos endpoint
router.get('/videos', async (req, res) => {
  try {
    const videos = await getAllVideos();
    res.json({ videos });
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.status(500).json({ error: 'Failed to fetch video list.' });
  }
});
export default router;
