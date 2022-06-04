import express from 'express';
import dbContext from './app/database/dbContext.js';

const app = express();
app.use(express.json());
app.use(dbContext.middleware);
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.get('/dbs', (req, res) => {
    dbContext.listDatabases();
    res.send('listed');
});

app.post('/album', async (req, res) => {
    var result = await dbContext.createAlbum(req.body, req.app.db);
    res.json(result);
    console.log('result', result);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});