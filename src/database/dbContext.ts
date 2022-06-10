import 'dotenv/config'
import { MongoClient, Db } from 'mongodb';
import { Request, Response, NextFunction } from 'express';

const MONGO_DB_URI = process.env.MONGODB_CONNECTION_STRING;
const DB_NAME = process.env.DB_NAME;

var dbContext = {
    middleware: async (req: Request, res: Response, next: NextFunction) => {
        if (!req.app.locals.db) {
            const client = await MongoClient.connect(MONGO_DB_URI);
            const db = client.db(DB_NAME);
            console.log('conexao aberta');
            req.app.locals.dbClient = client;
            req.app.locals.db = db;
        };
        
        next();
    },
    createOrUpdate: async (collectionName: string, payload: any, db: Db) => {
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