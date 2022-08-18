import util from "../util/util.js";

export type tokenType = {
    key?: string;
    code?: string;
    broadcaster_id?: number;
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string[];
    token_type: string;
    profile_image_url: string;
    created_at: Date;
};

let tokenModel: tokenType = {
    key: '',
    code: '',
    broadcaster_id: 0,
    access_token: '',
    expires_in: 0,
    refresh_token: '',
    scope: [],
    token_type: '',
    profile_image_url: '',
    created_at: util.minDate()
};

export default tokenModel;