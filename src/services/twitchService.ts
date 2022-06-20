import axios from 'axios';
import 'dotenv/config'
import { Db } from 'mongodb';
import { tokenType } from '../models/tokenModel';
import { userInfoType } from '../models/userInfoModel';
import util from '../util/util.js';
import TokenService from './tokenService';
import qs from 'qs'
import customRewardModel, { customRewardType } from '../models/customRewardModel.js';

class TwitchService {
    db: Db;

    constructor(db: Db) {
        this.db = db;
    };

    getTwitchRedirectUrl(channel_name: string) {
        return `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${process.env.TWITCH_CLIENT_ID}&redirect_uri=${process.env.TWITCH_REDIRECT_URL}&state=${channel_name}&scope=${process.env.TWITCH_SCOPES}`;
    };

    async getUserInfo(access_token: string) {
        let result = await axios.get('https://api.twitch.tv/helix/users', {
            headers: {
                "Authorization": `Bearer ${access_token}`,
                "Client-Id": process.env.TWITCH_CLIENT_ID
            }
        });
        util.ensureAxiosSuccessCode(result, 'Error getting user info');

        return result.data.data[0];
    };

    async getOAuthToken(code: string) {
        let payload = {
            client_id: process.env.TWITCH_CLIENT_ID,
            client_secret: process.env.TWITCH_CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: process.env.TWITCH_REDIRECT_URL
        };

        let result = await axios.post('https://id.twitch.tv/oauth2/token', payload);
        util.ensureAxiosSuccessCode(result, 'Error retrieving oauth token');

        return result.data;
    };
    
    async handleTwitchCallback(code: string, channel_name: string, tokenService: TokenService, db: Db) {
        try {
            let token: tokenType = await this.getOAuthToken(code);
            let userinfo: userInfoType = await this.getUserInfo(token.access_token);

            if (userinfo.login !== channel_name) {
                throw util.createError(401, `You are not authorized to access ${channel_name} channel`);
            } else {
                token.key = channel_name;
                token.code = code;
                token.broadcaster_id = userinfo.id;
                token.profile_image_url = userinfo.profile_image_url;
                await tokenService.saveToken(token, db);
                
                return `${token.key};${token.code}`;
            };
        } catch (e) {
            throw util.handleError(e, "Error processing callback");
        };
    };

    async isTokenValid(access_token: string) {
        let result = await axios.get('https://api.twitch.tv/helix/users', {
            headers: {
                "Authorization": `Bearer ${access_token}`,
                "Client-Id": process.env.TWITCH_CLIENT_ID
            }
        });
        
        return result.status == 200;
    };

    async refreshTokenIfNecessary(token: tokenType) {
        const isTokenValid = await this.isTokenValid(token.access_token);

        if (!isTokenValid) {
            const data = {
                "grant_type": "refresh_token",
                "refresh_token": token.refresh_token,
                "client_id": process.env.TWITCH_CLIENT_ID,
                "client_secret": process.env.TWITCH_CLIENT_SECRET
            };

            const options = {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            };

            const result = await axios.post('https://id.twitch.tv/oauth2/token', qs.stringify(data), options);
            util.ensureAxiosSuccessCode(result, 'Twitch token was invalidated, please login again');

            return result.data;
        };

        return null;
    };

    /*
    async getRedemption(id: string, tokenService: TokenService, authorization?: string) {
        const token = await tokenService.getToken(this.db, this, authorization);
        const result = await axios.get(`https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=274637212&reward_id=92af127c-7326-4483-a52b-b0da0be61c01&id=${id}`, {
            headers: {
                "Client-Id": process.env.TWITCH_CLIENT_ID,
                "Authorization": `Bearer ${token.access_token}`
            }
        });
    };
    */

    async getCustomRewards(tokenService: TokenService, authorization?: string): Promise<customRewardType[]> {
        const token = await tokenService.getToken(this.db, this, authorization);
        const result = await axios.get(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${token.broadcaster_id}`, {
            headers: {
                "Client-Id": process.env.TWITCH_CLIENT_ID,
                "Authorization": `Bearer ${token.access_token}`
            }
        });

        return result.data.data.map((payload: customRewardType) => {
            return util.equalizePayloadWithModel(customRewardModel, payload);
        });
    };
};

export default TwitchService;