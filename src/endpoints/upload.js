import { uploadVideoToS3 } from '../classes/s3.js';
import { insertVideo } from '../classes/mongo.js';
import { isSupportedVideoType, isValidVideoSize, getCurrentISOString } from '../functions/utils.js';
import multer from 'multer';
import express from 'express';
const router = express.Router();
const upload = multer();
// POST /upload endpoint
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    // Validate required fields
    const { title = '', description = '' } = req.body;
    if (!title.trim() || !description.trim()) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }
    // Validate file
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Video file is required.' });
    }
    if (!isSupportedVideoType(file.mimetype)) {
      return res.status(400).json({ error: 'Unsupported video file type.' });
    }
    if (!isValidVideoSize(file.size)) {
      return res.status(400).json({ error: 'Video file size exceeds limit (200MB).' });
    }
    // Upload to AWS S3
    const location = await uploadVideoToS3(file.buffer, file.originalname, file.mimetype);
    // Prepare metadata
    const uploadedTime = getCurrentISOString();
    const videoDoc = {
      title: title.trim(),
      description: description.trim(),
      uploadedTime,
      location
    };
    // Insert record to MongoDB
    await insertVideo(videoDoc);
    res.json({ success: true, video: videoDoc });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'An error occurred while uploading the video.' });
  }
});
export default router;
