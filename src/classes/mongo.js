import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'aiWorkSpace2';
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable not set');
}
let client;
let db;
export async function connectMongo() {
  if (!client) {
    client = new MongoClient(MONGODB_URI, {});
    await client.connect();
    db = client.db(MONGODB_DB);
  }
  return db;
}
export function getVideosCollection() {
  if (!db) {
    throw new Error('MongoDB client not connected');
  }
  return db.collection('Videos');
}
export async function insertVideo(videoDoc) {
  const collection = getVideosCollection();
  const result = await collection.insertOne(videoDoc);
  return result.insertedId;
}
export async function getAllVideos() {
  const collection = getVideosCollection();
  const videos = await collection.find({}, {
    projection: {
      _id: 0,
      title: 1,
      description: 1,
      uploadedTime: 1,
      location: 1
    }
  }).sort({ uploadedTime: -1 }).toArray();
  return videos;
}
export async function closeMongo() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
