import { Url } from "url";

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            EXPRESS_PORT: number;
            MONGODB_CONNECTION_STRING: string;
            DB_NAME: string;
            ALBUM_COLLECTION_NAME: string;
            STORE_IMAGE_ON_DATABASE: boolean;
            IMG_API_UPLOAD_URI: URL;
            IMG_API_KEY: string;
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}