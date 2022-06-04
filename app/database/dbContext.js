import 'dotenv/config'
import { MongoClient } from 'mongodb';

const MONGO_DB_URI = process.env.MONGODB_CONNECTION_STRING;
const DB_NAME = process.env.DB_NAME;

var dbContext = {
    createAlbum: async (payload) => {
        MongoClient.connect(MONGO_DB_URI, { useUnifiedTopology: true }).then(client => {
            const db = client.db(DB_NAME);
            const albumsCollection = db.collection('albums');

            albumsCollection.insertOne(payload).then(result => {
                return result;
            }).catch(error => console.error(error));
        });
    }
};

export default dbContext;