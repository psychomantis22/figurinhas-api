import 'dotenv/config'
import express from 'express';
import dbContext from './database/dbContext.js';
import mainService from './services/mainService.js';

const app = express();
app.use(express.json());
app.use(dbContext.middleware);
app.use(mainService.injectServices);
const port = process.env.EXPRESS_PORT;

//ALBUM
app.get('/album', async (req, res) => {
    try {
        let result;
        if (req.query.key) {
            result = await req.app.locals.albumService.getAlbumByKey(req.query.key, req.header(process.env.AUTHORIZATION_HEADER_NAME));
        } else {
            result = await req.app.locals.albumService.getAlbums(req.header(process.env.AUTHORIZATION_HEADER_NAME));
        }
        res.json(result);
    } catch(e) {
        res.status(500).send(e);
    };
});

app.get('/album/:id', async (req, res) => {
    try {
        let result = await req.app.locals.albumService.getAlbumById(req.params.id, req.header(process.env.AUTHORIZATION_HEADER_NAME));
        res.json(result);
    } catch(e) {
        res.status(500).send(e);
    };
});

app.post('/album', async (req, res) => {
    try {
        var result = await req.app.locals.albumService.createOrUpdateAlbum(req.body, req.header(process.env.AUTHORIZATION_HEADER_NAME));
        res.json(result);
    } catch (e) {
        res.status(500).send(e);
    };
});

//FIGURINHA
app.get('/figurinha', async (req, res) => {
    try {
        let result;
        if (req.query.key) {
            result = await req.app.locals.figurinhaService.getFigurinhaByKey(req.query.key, req.header(process.env.AUTHORIZATION_HEADER_NAME));
        } else {
            result = await req.app.locals.figurinhaService.getFigurinhas(req.header(process.env.AUTHORIZATION_HEADER_NAME));
        }
        res.json(result);
    } catch(e) {
        res.status(500).send(e);
    };
});

app.get('/figurinha/:id', async (req, res) => {
    try {
        let result = await req.app.locals.figurinhaService.getFigurinhaById(req.params.id, req.header(process.env.AUTHORIZATION_HEADER_NAME));
        res.json(result);
    } catch(e) {
        res.status(500).send(e);
    };
});

app.post('/figurinha', async (req, res) => {
    try {
        var result = await req.app.locals.figurinhaService.createOrUpdateFigurinha(req.body, req.header(process.env.AUTHORIZATION_HEADER_NAME));
        res.json(result);
    } catch (e) {
        res.status(500).send(e);
    };
});

//AUTH
app.get('/auth/token', async (req, res) => {
    try {
        let channel_name = req.query.channel;
        if (channel_name) {
            var redirectUrl = req.app.locals.tokenService.getTwitchRedirectUrl(channel_name);
            res.redirect(redirectUrl);
        } else {
            res.status(400).send('missing channel name');
        };
    } catch (e) {
        res.status(500).send(e);
    };
});

app.get('/auth/callback', async (req, res) => {
    try {
        let result = await req.app.locals.tokenService.handleTwitchCallback(req.query.code, req.query.state, req.app.locals.db);
        res.send(`Access verified, please use this code to access the API: ${result}`);
    } catch (e) {
        res.status(500).send(e);
    };
});

//INICIANDO EXPRESS
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

app.listen(process.env.PORT || 3000, () => {
    console.log(`Listening on port ${port}`);
});