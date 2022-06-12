export type albumImageType = {
    base64?: string;
    display_url: string;
};

export type albumType = {
    key: string;
    name: string;
    image: albumImageType;
};

let albumModel: albumType = {
    key: '',
    name: '',
    image: {
        base64: '',
        display_url: ''
    }
};

export default albumModel;