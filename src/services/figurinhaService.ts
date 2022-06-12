import 'dotenv/config'
import { Db } from 'mongodb'
import dbContext from '../database/dbContext.js';
import figurinhaModel, { figurinhaType } from '../models/figurinhaModel.js';
import util from '../util/util.js';
import AlbumService from './albumService.js';
import ImageBBService from './imgbbService.js';

class FigurinhaService {
    db: Db;
    albumService: AlbumService
    collectionName: string;
    storeImageOnDatabase: boolean;

    constructor(db: Db, albumService: AlbumService) {
        this.db = db;
        this.albumService = albumService;
        this.collectionName = process.env.FIGURINHAS_COLLECTION_NAME;
        this.storeImageOnDatabase = process.env.STORE_IMAGE_ON_DATABASE;
    };

    async validate(figurinha: figurinhaType, authorization: string) {
        if (!figurinha.key) {
            return { success: false, errorMessage: 'Missing key' };
        };

        if (!figurinha.name) {
            return { success: false, errorMessage: 'Missing name' };
        };

        if (!figurinha.album_key) {
            return { success: false, errorMessage: 'Missing album' };
        };

        if (!figurinha.image.base64) {
            return { success: false, errorMessage: 'Missing image' };
        };

        const album = await this.albumService.getAlbumByKey(figurinha.album_key, authorization);

        if (!album) {
            return { success: false, errorMessage: `Album with key ${figurinha.album_key} not found` };
        };

        return { success: true, errorMessage: '' };
    };

    async getFigurinhaByKey(key: string, authorization: string) {
        return await dbContext.getOneByKey<figurinhaType>(this.collectionName, key, authorization, this.db);
    };

    async getFigurinhaById(id: string, authorization: string) {
        return await dbContext.getOneById<figurinhaType>(this.collectionName, id, authorization, this.db);
    };

    async getFigurinhas(authorization: string) {
        return await dbContext.getAll<figurinhaType>(this.collectionName, authorization, this.db);
    };

    async createOrUpdateFigurinha(payload: figurinhaType, authorization: string) {
        payload = util.equalizePayloadWithModel(figurinhaModel, payload);
        let validateResult = await this.validate(payload, authorization);

        if (!validateResult.success) {
            throw validateResult.errorMessage;
        };

        try {
            const imageBBService = new ImageBBService();
            const uploadResult = await imageBBService.uploadImage(payload.image.base64);

            if (uploadResult.success) {
                payload.image.base64 = this.storeImageOnDatabase ? payload.image.base64 : '';
                payload.image.display_url = uploadResult.data.display_url;
                return await dbContext.createOrUpdate(this.collectionName, payload, authorization, this.db);
            } else {
                throw "Error uploading image.";
            };
        } catch (e) {
            console.error(e);
            if (typeof e === 'string' || e instanceof String) {
                throw e;
            } else {
                throw "createOrUpdateFigurinha error";
            };
        };
    };
};

export default FigurinhaService;