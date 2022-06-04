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
        };
        
        next();
    },
    createOrUpdate: async (collectionName, payload, db) => {
        try {
            if (!payload.key) {
                throw `Key not informed`;
            };

            const collection = db.collection(collectionName);

            const query = { key: payload.key };
            const update = { $set: payload};
            const options = { upsert: true };
            return await collection.updateOne(query, update, options);
        } catch (e) {
            console.error(e);
            throw e;
        };
    }
};

export default dbContext;