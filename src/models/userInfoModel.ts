export type userInfoType = {
    id: number;
    login: string;
    profile_image_url: string;
};

let userInfoModel: userInfoType = {
    id: 0,
    login: '',
    profile_image_url: ''
};

export default userInfoModel;