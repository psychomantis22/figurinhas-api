export type tokenType = {
    key?: string;
    code?: string,
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string[];
    token_type: string;
};

let tokenModel: tokenType = {
    key: '',
    code: '',
    access_token: '',
    expires_in: 0,
    refresh_token: '',
    scope: [],
    token_type: ''
};

export default tokenModel;