import 'dotenv/config'
import { Db } from 'mongodb'
import tokenModel, { tokenType } from '../models/tokenModel.js';
import util from '../util/util.js';
import TwitchService from './twitchService.js';

class TokenService {
    db: Db;
    collectionName: string;
    
    constructor(db: Db) {
        this.db = db;
        this.collectionName = process.env.TOKEN_COLLECTION_NAME;
    };

    async saveToken(payload: tokenType, db: Db): Promise<void> {
        payload = util.equalizePayloadWithModel(tokenModel, payload);

        payload.created_at = new Date();
        const collection = db.collection(this.collectionName);
        const query = { key: payload.key };
        const update = { $set: payload};
        const options = { upsert: true };
        await collection.updateOne(query, update, options);
    };

    async getToken(db: Db, twitchService: TwitchService, authorization?: string) {
        if (authorization && authorization.includes(';')) {
            let channel_name = authorization.split(';')[0];
            let code = authorization.split(';')[1];

            const collection = db.collection(this.collectionName);
            const query = { key: channel_name, code: code };
            let result: tokenType = ((await collection.findOne(query)) as unknown) as tokenType;

            const refreshedToken: tokenType = await twitchService.refreshTokenIfNecessary(result);

            if (refreshedToken) {
                result = { ...result, ...refreshedToken };
                await this.saveToken(result, db);
            };

            return result;
        } else {
            throw util.createError(400, 'Missing authorization');
        };
    };
};

export default TokenService;