import 'dotenv/config'
import { MongoClient, ObjectId, Db } from 'mongodb';
import { Request, Response, NextFunction } from 'express';
import { tokenType } from '../models/tokenModel';

const MONGO_DB_URI = process.env.MONGODB_CONNECTION_STRING;
const DB_NAME = process.env.DB_NAME;
const TOKEN_COLLECTION_NAME = process.env.TOKEN_COLLECTION_NAME;

async function getCollectionFullName(collectionName: string, authorization: string, db: Db): Promise<string> {
    if (authorization && authorization.includes(';')) {
        let collectionFullName: string;
        let channel_name = authorization.split(';')[0];
        let code = authorization.split(';')[1];

        const collection = db.collection(TOKEN_COLLECTION_NAME);
        const query = { key: channel_name };
        const token: tokenType = (await collection.findOne(query) as unknown) as tokenType;

        if (token && token.code === code) {
            collectionFullName = `${collectionName}-${channel_name}`;
            return collectionFullName;
        } else {
            throw "Unauthorized";
        };
    } else {
        throw "Authorization header invalid or missing";
    };
};

function convertToObjectId(value: string): ObjectId {
    let result;
    try {
        return new ObjectId(value);
    } catch {
        throw "Invalid id";
    };
};

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
    async createOrUpdate (collectionName: string, payload: any, authorization: string, db: Db): Promise<void> {
        try {
            if (!payload.key) {
                throw `Key not informed`;
            };

            const collectionFullName = await getCollectionFullName(collectionName, authorization, db);
            const collection = db.collection(collectionFullName);

            const query = { key: payload.key };
            const update = { $set: payload};
            const options = { upsert: true };
            await collection.updateOne(query, update, options);
        } catch (e) {
            console.error(e);

            if (typeof e === 'string' || e instanceof String) {
                throw e;
            } else {
                throw "createOrUpdate error";
            };
        };
    },
    async getOneById<Type>(collectionName: string, id: string, authorization: string, db: Db): Promise<Type> {
        try {
            const collectionFullName = await getCollectionFullName(collectionName, authorization, db);
            const collection = db.collection(collectionFullName);
            const query = { _id: convertToObjectId(id) };
            const result: Type = (await collection.findOne(query) as unknown) as Type;
            return result;
        } catch (e) {
            console.error(e);
            
            if (typeof e === 'string' || e instanceof String) {
                throw e;
            } else {
                throw "getOne error";
            };
        };
    },
    async getOneByKey<Type>(collectionName: string, key: string, authorization: string, db: Db): Promise<Type> {
        try {
            const collectionFullName = await getCollectionFullName(collectionName, authorization, db);
            const collection = db.collection(collectionFullName);
            const query = { key: key };
            const result: Type = (await collection.findOne(query) as unknown) as Type;
            return result;
        } catch (e) {
            console.error(e);
            
            if (typeof e === 'string' || e instanceof String) {
                throw e;
            } else {
                throw "getOne error";
            };
        };
    },
    async getAll<Type>(collectionName: string, authorization: string, db: Db): Promise<Type[]> {
        try {
            const collectionFullName = await getCollectionFullName(collectionName, authorization, db);
            const collection = db.collection(collectionFullName);
            const result: Type[] = (await collection.find().toArray() as unknown) as Type[];
            return result;
        } catch (e) {
            console.error(e);
            
            if (typeof e === 'string' || e instanceof String) {
                throw e;
            } else {
                throw "getOne error";
            };
        };
    }
};

export default dbContext;