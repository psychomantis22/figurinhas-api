export type figurinhaImageType = {
    base64?: string;
    display_url: string;
};

export type figurinhaType = {
    key: string;
    album_key: string;
    name: string;
    image: figurinhaImageType;
};

let figurinhaModel: figurinhaType = {
    key: '',
    album_key: '',
    name: '',
    image: {
        base64: '',
        display_url: ''
    }
};

export default figurinhaModel;