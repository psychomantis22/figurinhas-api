import 'dotenv/config'
import dbContext from '../database/dbContext.js';
import albumModel from '../models/albumModel.js';
import util from '../util/util.js';

class AlbumService {
    constructor(db) {
        this.db = db;
        this.collectionName = process.env.ALBUM_COLLECTION_NAME;
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

        return await dbContext.createOrUpdate(this.collectionName, payload, this.db);
    };
};

export default AlbumService;