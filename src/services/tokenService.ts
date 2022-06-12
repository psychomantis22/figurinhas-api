import 'dotenv/config'
import axios from 'axios';
import { Db } from 'mongodb'
import dbContext from '../database/dbContext.js';
import tokenModel, { tokenType } from '../models/tokenModel.js';
import userInfoModel, { userInfoType } from '../models/userInfoModel.js';
import util from '../util/util.js';

class TokenService {
    db: Db;
    collectionName: string;
    
    constructor(db: Db) {
        this.db = db;
        this.collectionName = process.env.TOKEN_COLLECTION_NAME;
    };

    getTwitchRedirectUrl(channel_name: string) {
        return `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${process.env.TWITCH_CLIENT_ID}&redirect_uri=${process.env.TWITCH_REDIRECT_URL}&state=${channel_name}&scope=channel%3Aread%3Aredemptions+channel%3Amanage%3Aredemptions`;
    };

    async handleTwitchCallback(code: string, channel_name: string, db: Db) {
        try {
            let token: tokenType = await this.getToken(code);
            let userinfo: userInfoType = await this.getUserInfo(token.access_token);

            if (userinfo.preferred_username !== channel_name) {
                throw `You are not authorized to access ${channel_name} channel`;
            } else {
                token.key = channel_name;
                token.code = code;
                await this.saveToken(token, db);
                
                return `${token.key};${token.code}`;
            };
        } catch (e) {
            console.log(e);
            throw "Error processing callback";
        };
    };

    async saveToken(payload: tokenType, db: Db): Promise<void> {
        payload = util.equalizePayloadWithModel(tokenModel, payload);

        const collection = db.collection(this.collectionName);
        const query = { key: payload.key };
        const update = { $set: payload};
        const options = { upsert: true };
        await collection.updateOne(query, update, options);
    };

    async getUserInfo(access_token: string) {
        let result = await axios.get('https://id.twitch.tv/oauth2/userinfo', {
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        });

        return result.data;
    };

    async getToken(code: string) {
        let payload = {
            client_id: process.env.TWITCH_CLIENT_ID,
            client_secret: process.env.TWITCH_CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: process.env.TWITCH_REDIRECT_URL
        };

        let result = await axios.post('https://id.twitch.tv/oauth2/token', payload);

        return result.data;
    };
};

export default TokenService;