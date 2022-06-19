import 'express';
import { Db, MongoClient } from 'mongodb';
import AlbumService from './services/albumService';
import FigurinhaService from './services/figurinhaService';
import TokenService from './services/tokenService';

interface AppServices {
    figurinhaService: FigurinhaService;
    albumService: AlbumService;
    tokenService: TokenService;
}

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: number;
            AUTHORIZATION_HEADER_NAME: string;
            MONGODB_CONNECTION_STRING: string;
            DB_NAME: string;
            ALBUM_COLLECTION_NAME: string;
            FIGURINHAS_COLLECTION_NAME: string;
            TOKEN_COLLECTION_NAME: string;
            STORE_IMAGE_ON_DATABASE: boolean;
            IMG_API_UPLOAD_URI: URL;
            IMG_API_KEY: string;
            TWITCH_CLIENT_ID: string;
            TWITCH_CLIENT_SECRET: string;
            TWITCH_REDIRECT_URL: string;
        }
    }
    namespace Express {
        interface Application {
            db: Db;
            dbClient: MongoClient;
            services: AppServices;
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}