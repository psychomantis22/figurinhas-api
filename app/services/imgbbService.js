import 'dotenv/config';
import axios from 'axios';
import FormData from 'form-data';

const IMG_API_UPLOAD_URI = process.env.IMG_API_UPLOAD_URI;
const IMG_API_KEY = process.env.IMG_API_KEY;

class ImageBBService {
    constructor() {
        this.uploadURI = IMG_API_UPLOAD_URI;
        this.apiKey = IMG_API_KEY;
    };

    async uploadImage(base64) {
        let formData = new FormData();
        formData.append("image", base64);
        const result = await axios.post(`${this.uploadURI}?key=${IMG_API_KEY}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return result.data;
    };
};

export default ImageBBService;