export type albumImageType = {
    base64?: string;
    display_url: string;
};

export type albumType = {
    key: string;
    name: string;
    reward_id: string;
    image: albumImageType;
};

let albumModel: albumType = {
    key: '',
    name: '',
    reward_id: '',
    image: {
        base64: '',
        display_url: ''
    }
};

export default albumModel;