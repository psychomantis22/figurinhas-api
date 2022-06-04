import 'dotenv/config'
import { MongoClient } from 'mongodb';

const MONGO_DB_URI = process.env.MONGODB_CONNECTION_STRING;
const DB_NAME = process.env.DB_NAME;

var dbContext = {
    middleware: async (req, res, next) => {
        if (!req.app.db) {
            const client = await MongoClient.connect(MONGO_DB_URI, { useUnifiedTopology: true });
            const db = client.db(DB_NAME);
    
            req.app.db = db;
            console.log('connection opened');
        }
        
        next();
    },
    createAlbum: async (payload, db) => {
        try {
            const albumsCollection = db.collection('albums');
            return await albumsCollection.insertOne(payload);
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
};

export default dbContext;