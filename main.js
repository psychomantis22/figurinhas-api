import express from 'express';
import dbContext from './app/database/dbContext.js';
import mainService from './app/services/mainService.js';

const app = express();
app.use(express.json());
app.use(dbContext.middleware);
app.use(mainService.injectServices);
const port = 3000;

app.post('/album', async (req, res) => {
    try {
        var result = await req.app.albumService.createOrUpdateAlbum(req.body);
        res.json(result);
    } catch (e) {
        res.status(500).send(e);
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});

function cleanup() {
    if (app.db) app.db.close();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);