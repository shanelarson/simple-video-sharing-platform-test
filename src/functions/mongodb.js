import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = 'aiWorkSpace2';
const COLLECTION_NAME = 'Videos';
let client;
let db;
let collection;
let opened = false;
async function connectMongo() {
    if (opened && db && collection) return { db, collection };
    client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
    await client.connect();
    db = client.db(DATABASE_NAME);
    collection = db.collection(COLLECTION_NAME);
    // Create index on uploadedTime for listing/sorting
    // Create text index for search (optional, but good initial default)
    await collection.createIndex({ uploadedTime: -1 });
    await collection.createIndex(
        { title: 'text', description: 'text' },
        { name: 'VideoTextIndex' }
    );
    opened = true;
    return { db, collection };
}
export async function getVideosCollection() {
    const { collection } = await connectMongo();
    return collection;
}
export async function insertVideoDocument(doc) {
    const col = await getVideosCollection();
    return col.insertOne(doc);
}
export async function listVideos(limit = 100) {
    const col = await getVideosCollection();
    return col
        .find({}, { projection: { _id: 0 } })
        .sort({ uploadedTime: -1 })
        .limit(limit)
        .toArray();
}
export async function closeMongo() {
    if (client) await client.close();
    opened = false;
}
