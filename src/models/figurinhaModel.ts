export type figurinhaImageType = {
    base64?: string;
    display_url: string;
};

export type figurinhaType = {
    key: string;
    album_key: string;
    name: string;
    rarity: number;
    image: figurinhaImageType;
};

let figurinhaModel: figurinhaType = {
    key: '',
    album_key: '',
    name: '',
    rarity: 0,
    image: {
        base64: '',
        display_url: ''
    }
};

export default figurinhaModel;