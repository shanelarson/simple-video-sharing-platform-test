import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
dotenv.config();
const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET_NAME) {
  throw new Error('AWS S3 configuration environment variables are not set');
}
export const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  }
});
export async function uploadVideoToS3(fileBuffer, originalName, mimetype) {
  const ext = originalName.includes('.') ? originalName.substring(originalName.lastIndexOf('.') + 1) : '';
  const fileKey = `videos/${uuidv4()}${ext ? '.' + ext : ''}`;
  const params = {
    Bucket: AWS_S3_BUCKET_NAME,
    Key: fileKey,
    Body: fileBuffer,
    ContentType: mimetype
  };
  await s3Client.send(new PutObjectCommand(params));
  // Assume public URL for object
  const location = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${fileKey}`;
  return location;
}
