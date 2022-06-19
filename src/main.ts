import 'dotenv/config'
import express from 'express';
import dbContext from './database/dbContext.js';
import mainService from './services/mainService.js';
import path from 'path';
import axios from 'axios';

const app = express();
app.use(express.json({limit: '1mb'}));
app.use(dbContext.middleware);
app.use(mainService.injectServices);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'src/tempsite.html'));
});

app.get('/tempsite.js', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'src/tempsite.js'));
});

//ALBUM
app.get('/album/image/default', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'src/images/albumDefault.png'));
});

app.get('/album', async (req, res) => {
    try {
        let result;
        if (req.query.key) {
            result = await req.app.services.albumService.getAlbumByKey(req.query.key.toString(), req.header(process.env.AUTHORIZATION_HEADER_NAME));
        } else {
            result = await req.app.services.albumService.getAlbums(req.header(process.env.AUTHORIZATION_HEADER_NAME));
        }
        res.json(result);
    } catch(e) {
        res.status(500).send(e);
    };
});

app.get('/album/:id', async (req, res) => {
    try {
        let result = await req.app.services.albumService.getAlbumById(req.params.id, req.header(process.env.AUTHORIZATION_HEADER_NAME));
        res.json(result);
    } catch(e) {
        res.status(500).send(e);
    };
});

app.post('/album', async (req, res) => {
    try {
        var result = await req.app.services.albumService.createOrUpdateAlbum(req.body, req.header(process.env.AUTHORIZATION_HEADER_NAME));
        res.json(result);
    } catch (e) {
        res.status(500).send(e);
    };
});

app.delete('/album/:id', async (req, res) => {
    try {
        let result = await req.app.services.albumService.deleteAlbumById(req.params.id, req.header(process.env.AUTHORIZATION_HEADER_NAME));
        res.json(result);
    } catch(e) {
        res.status(500).send(e);
    };
});

//FIGURINHA
app.get('/figurinha', async (req, res) => {
    try {
        let result;
        if (req.query.key) {
            result = await req.app.services.figurinhaService.getFigurinhaByKey(req.query.key.toString(), req.header(process.env.AUTHORIZATION_HEADER_NAME));
        } else if (req.query.album_key) {
            result = await req.app.services.figurinhaService.getFigurinhaByAlbumKey(req.query.album_key.toString(), req.header(process.env.AUTHORIZATION_HEADER_NAME));
        } else {
            result = await req.app.services.figurinhaService.getFigurinhas(req.header(process.env.AUTHORIZATION_HEADER_NAME));
        }
        res.json(result);
    } catch(e) {
        res.status(500).send(e);
    };
});

app.get('/figurinha/:id', async (req, res) => {
    try {
        let result = await req.app.services.figurinhaService.getFigurinhaById(req.params.id, req.header(process.env.AUTHORIZATION_HEADER_NAME));
        res.json(result);
    } catch(e) {
        res.status(500).send(e);
    };
});

app.post('/figurinha', async (req, res) => {
    try {
        var result = await req.app.services.figurinhaService.createOrUpdateFigurinha(req.body, req.header(process.env.AUTHORIZATION_HEADER_NAME));
        res.json(result);
    } catch (e) {
        res.status(500).send(e);
    };
});

//AUTH
app.get('/auth/token', async (req, res) => {
    try {
        if (req.query.channel) {
            var redirectUrl = req.app.services.tokenService.getTwitchRedirectUrl(req.query.channel.toString());
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
        if (req.query.code && req.query.state) {
            let result = await req.app.services.tokenService.handleTwitchCallback(req.query.code.toString(), req.query.state.toString(), req.app.db);
            res.json({ "Authorization": result });
        } else {
            res.status(400).json({ error: true, message: "Missing code or state" });
        }
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

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
    axios.get('https://api.ipify.org/')
    .then(function(result) {
        console.log(result.data);
    })
    .catch(function () {
        console.log("coundn't get ip");
    });
});