import 'dotenv/config'
import { MongoClient, ObjectId, Db } from 'mongodb';
import { Request, Response, NextFunction } from 'express';
import { tokenType } from '../models/tokenModel';
import util from '../util/util.js';

const MONGO_DB_URI = process.env.MONGODB_CONNECTION_STRING;
const DB_NAME = process.env.DB_NAME;
const TOKEN_COLLECTION_NAME = process.env.TOKEN_COLLECTION_NAME;

async function getCollectionFullName(collectionName: string, db: Db, authorization?: string): Promise<string> {
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
            throw util.createError(401, "Unauthorized");
        };
    } else {
        throw util.createError(401, "Authorization header invalid or missing");
    };
};

function convertToObjectId(value: string): ObjectId {
    let result;
    try {
        return new ObjectId(value);
    } catch {
        throw util.createError(400, "Invalid id");
    };
};

var dbContext = {
    middleware: async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.app.db) {
                const client = await MongoClient.connect(MONGO_DB_URI);
                const db = client.db(DB_NAME);
                console.log('conexao aberta');
                req.app.dbClient = client;
                req.app.db = db;
            };
            
            next();
        } catch (e) {
            const error = util.handleError(e, "Error opening connection");
            res.status(error.status).json(error);
        };
    },
    async createOrUpdate (collectionName: string, payload: any, db: Db, authorization?: string): Promise<void> {
        try {
            if (!payload.key) {
                throw util.createError(400, "Key not informed");
            };

            const collectionFullName = await getCollectionFullName(collectionName, db, authorization);
            const collection = db.collection(collectionFullName);

            const query = { key: payload.key };
            const update = { $set: payload};
            const options = { upsert: true };
            await collection.updateOne(query, update, options);
        } catch (e) {
            const err = util.handleError(e, "createOrUpdate error");
            throw err;
        };
    },
    async getOneById<Type>(collectionName: string, id: string, db: Db, authorization?: string): Promise<Type> {
        try {
            const collectionFullName = await getCollectionFullName(collectionName, db, authorization);
            const collection = db.collection(collectionFullName);
            const query = { _id: convertToObjectId(id) };
            const result: Type = (await collection.findOne(query) as unknown) as Type;
            return result;
        } catch (e) {
            const err = util.handleError(e, "getOneById error");
            throw err;
        };
    },
    async deleteById(collectionName: string, id: string, db: Db, authorization?: string): Promise<void> {
        try {
            const collectionFullName = await getCollectionFullName(collectionName, db, authorization);
            const collection = db.collection(collectionFullName);
            const query = { _id: convertToObjectId(id) };
            await collection.deleteOne(query);
        } catch (e) {
            const err = util.handleError(e, "deleteById error");
            throw err;
        };
    },
    async getOneByKey<Type>(collectionName: string, key: string, db: Db, authorization?: string): Promise<Type> {
        try {
            const collectionFullName = await getCollectionFullName(collectionName, db, authorization);
            const collection = db.collection(collectionFullName);
            const query = { key: key };
            const result: Type = (await collection.findOne(query) as unknown) as Type;
            return result;
        } catch (e) {
            const err = util.handleError(e, "getOneByKey error");
            throw err;
        };
    },
    async findOne<Type>(collectionName: string, query: any, db: Db, authorization?: string): Promise<Type> {
        try {
            const collectionFullName = await getCollectionFullName(collectionName, db, authorization);
            const collection = db.collection(collectionFullName);
            const result: Type = (await collection.findOne(query) as unknown) as Type;
            return result;
        } catch (e) {
            const err = util.handleError(e, "findOne error");
            throw err;
        };
    },
    async getAll<Type>(collectionName: string, db: Db, authorization?: string): Promise<Type[]> {
        try {
            const collectionFullName = await getCollectionFullName(collectionName, db, authorization);
            const collection = db.collection(collectionFullName);
            const result: Type[] = (await collection.find().toArray() as unknown) as Type[];
            return result;
        } catch (e) {
            const err = util.handleError(e, "getAll error");
            throw err;
        };
    }
};

export default dbContext;