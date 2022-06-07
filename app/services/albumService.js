import 'dotenv/config'
import dbContext from '../database/dbContext.js';
import albumModel from '../models/albumModel.js';
import util from '../util/util.js';
import ImageBBService from './imgbbService.js';

class AlbumService {
    constructor(db) {
        this.db = db;
        this.collectionName = process.env.ALBUM_COLLECTION_NAME;
        this.storeImageOnDatabase = process.env.STORE_IMAGE_ON_DATABASE;
    };

    validate(album) {
        if (!album.key) {
            return { success: false, errorMessage: 'Missing key' };
        };

        if (!album.name) {
            return { success: false, errorMessage: 'Missing name' };
        };

        if (!album.image.base64) {
            return { success: false, errorMessage: 'Missing image' };
        };

        return { success: true, errorMessage: '' };
    };

    async createOrUpdateAlbum(payload) {
        payload = util.equalizePayloadWithModel(albumModel, payload);
        let validateResult = this.validate(payload);

        if (!validateResult.success) {
            throw validateResult.errorMessage;
        };

        try {
            const imageBBService = new ImageBBService();
            const uploadResult = await imageBBService.uploadImage(payload.image.base64);

            if (uploadResult.success) {
                payload.image.base64 = this.storeImageOnDatabase ? payload.image.base64 : null;
                payload.image.display_url = uploadResult.data.display_url;
                return await dbContext.createOrUpdate(this.collectionName, payload, this.db);
            } else {
                throw "Error uploading image.";
            };
        } catch (e) {
            console.error(e);
            throw e;
        };
    };
};

export default AlbumService;