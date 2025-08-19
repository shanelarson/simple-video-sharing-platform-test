import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();
const S3_REGION = process.env.AWS_REGION || 'us-east-1';
const S3_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const S3_BUCKET = process.env.VIDEO_S3_BUCKET;
if (!S3_REGION || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY || !S3_BUCKET) {
    throw new Error('Missing AWS S3 environment variables.');
}
// AWS S3 client setup (using environment variables)
const s3Client = new S3Client({
    region: S3_REGION,
    credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY
    }
});
/**
 * Uploads a buffer/file to S3, returns the public URL of the uploaded object.
 * @param {Object} params
 * @param {Buffer} params.fileBuffer - Raw file buffer
 * @param {string} params.contentType - MIME type for S3
 * @param {string} params.originalName - Original filename for reference
 * @returns {Promise<string>} The public S3 URL of the uploaded object
 */
export async function uploadVideoToS3({ fileBuffer, contentType, originalName }) {
    // Make a somewhat unique key (timestamp + random + original extension)
    const ext = originalName.includes('.') ? originalName.substring(originalName.lastIndexOf('.')) : '';
    const time = Date.now();
    const rand = Math.floor(Math.random() * 100000);
    const key = `videos/${time}_${rand}${ext}`;
    const putParams = {
        Bucket: S3_BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType
        // Do not set ACL (per project instructions)
    };
    try {
        await s3Client.send(new PutObjectCommand(putParams));
        // Construct the S3 object URL (assume public, or bucket CORS enabled)
        // Public bucket: https://BUCKET.s3.amazonaws.com/key
        const url = `https://${S3_BUCKET}.s3.amazonaws.com/${encodeURIComponent(key)}`;
        return url;
    } catch (err) {
        // Log error for diagnostics
        console.error('S3 upload error:', err);
        throw err;
    }
}
