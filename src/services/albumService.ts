import 'dotenv/config'
import { Db } from 'mongodb'
import dbContext from '../database/dbContext.js';
import albumModel, { albumType } from '../models/albumModel.js';
import util from '../util/util.js';
import FigurinhaService from './figurinhaService.js';
import ImageBBService from './imgbbService.js';

class AlbumService {
    db: Db;
    collectionName: string;
    storeImageOnDatabase: boolean;

    constructor(db: Db) {
        this.db = db;
        this.collectionName = process.env.ALBUM_COLLECTION_NAME;
        this.storeImageOnDatabase = process.env.STORE_IMAGE_ON_DATABASE;
    };

    validate(album: albumType) {
        if (!album.key) {
            return { success: false, errorMessage: 'Missing key' };
        };

        if (!album.name) {
            return { success: false, errorMessage: 'Missing name' };
        };

        if (!album.reward_id) {
            return { success: false, errorMessage: 'Missing reward' };
        };

        if (!album.image.base64) {
            return { success: false, errorMessage: 'Missing image' };
        };

        return { success: true, errorMessage: '' };
    };

    async getAlbumByKey(key: string, authorization?: string) {
        return await dbContext.getOneByKey<albumType>(this.collectionName, key, this.db, authorization);
    };

    async getAlbumById(id: string, authorization?: string) {
        return await dbContext.getOneById<albumType>(this.collectionName, id, this.db, authorization);
    };

    async deleteAlbumById(id: string, figurinhaService: FigurinhaService, authorization?: string) {
        const album = await this.getAlbumById(id, authorization);
        const figurinhas = await figurinhaService.getFigurinhaByAlbumKey(album.key, authorization);

        if (figurinhas.length == 0) {
            return await dbContext.deleteById(this.collectionName, id, this.db, authorization);
        } else {
            throw util.createError(409, 'Album possui figurinhas e não pode ser excluído');
        };
    };

    async getAlbums(authorization?: string) {
        return await dbContext.getAll<albumType>(this.collectionName, this.db, authorization);
    };

    async createOrUpdateAlbum(payload: albumType, authorization?: string) {
        payload = util.equalizePayloadWithModel(albumModel, payload);
        let validateResult = this.validate(payload);

        if (!validateResult.success) {
            throw util.createError(400, validateResult.errorMessage);
        };

        try {
            const imageBBService = new ImageBBService();
            const uploadResult = await imageBBService.uploadImage(payload.image.base64);

            if (uploadResult.success) {
                payload.image.base64 = this.storeImageOnDatabase ? payload.image.base64 : '';
                payload.image.display_url = uploadResult.data.display_url;
                return await dbContext.createOrUpdate(this.collectionName, payload, this.db, authorization);
            } else {
                throw util.createError(500, "Error uploading image.");
            };
        } catch (e) {
            const err = util.handleError(e, "createOrUpdateAlbum error");
            throw err;
        };
    };
};

export default AlbumService;