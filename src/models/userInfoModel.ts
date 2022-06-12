import util from "../util/util.js";

export type userInfoType = {
    aud?: string,
    exp?: number,
    iat?: number,
    iss?: string,
    sub?: string,
    azp?: string,
    preferred_username: string
};

let userInfoModel: userInfoType = {
    aud: '',
    exp: 0,
    iat: 0,
    iss: '',
    sub: '',
    azp: '',
    preferred_username: ''
};

export default userInfoModel;