import express from 'express';
import multer from 'multer';
import { uploadVideoToS3 } from '../functions/s3Upload.js';
import { insertVideoDocument } from '../functions/mongodb.js';
const router = express.Router();
// Allowed file types and max size (100 MB default)
const ALLOWED_MIME_TYPES = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-matroska',
    'video/x-msvideo'
];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(new Error('Unsupported video file type.'));
        } else {
            cb(null, true);
        }
    }
});
// POST /api/upload
router.post('/api/upload', upload.single('video'), async (req, res) => {
    try {
        // Validate fields
        const { title, description } = req.body;
        if (
            typeof title !== 'string' ||
            title.trim().length < 1 ||
            title.length > 100
        ) {
            return res
                .status(400)
                .json({ error: 'Title is required (1-100 characters).' });
        }
        if (
            typeof description !== 'string' ||
            description.length > 1000
        ) {
            return res
                .status(400)
                .json({ error: 'Description too long (max 1000 chars).' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Video file is required.' });
        }
        // Prepare for S3 upload
        const fileBuffer = req.file.buffer;
        const contentType = req.file.mimetype;
        const originalName = req.file.originalname;
        // Upload to AWS S3
        const s3Url = await uploadVideoToS3({
            fileBuffer,
            contentType,
            originalName
        });
        // Compose video document
        const videoDoc = {
            title: title.trim(),
            description: description.trim(),
            uploadedTime: new Date(),
            location: s3Url
        };
        // Insert in MongoDB
        await insertVideoDocument(videoDoc);
        // Log success
        console.log(
            `[UPLOAD] Success: ${videoDoc.title} @ ${videoDoc.uploadedTime.toISOString()}`
        );
        return res.status(201).json({
            message: 'Video uploaded successfully.',
            video: {
                title: videoDoc.title,
                description: videoDoc.description,
                uploadedTime: videoDoc.uploadedTime,
                location: videoDoc.location
            }
        });
    } catch (err) {
        console.error('[UPLOAD] Error:', err);
        let errorMsg = 'Unknown error during upload.';
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                errorMsg = `File size exceeds limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`;
            }
        } else if (err.message) {
            errorMsg = err.message;
        }
        res.status(500).json({ error: errorMsg });
    }
});
export default router;
