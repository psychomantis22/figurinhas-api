import express from 'express';
import dbContext from './database/dbContext.js';
import mainService from './services/mainService.js';
import fs from 'fs';

const app = express();
app.use(express.json());
app.use(dbContext.middleware);
app.use(mainService.injectServices);
const port = 3000;

app.post('/album', async (req, res) => {
    try {
        var result = await req.app.locals.albumService.createOrUpdateAlbum(req.body);
        res.json(result);
    } catch (e) {
        res.status(500).send(e);
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

function cleanup(signal: any) {
    console.log(signal, 'cleaning...');
    if (app && app.locals && app.locals.db && app.locals.dbClient) {
        app.locals.dbClient.close();
    };
    process.exit();
};

process.once('SIGINT', cleanup);
process.once('SIGTERM', cleanup);
process.once('SIGQUIT', cleanup);
process.once('SIGKILL', cleanup);