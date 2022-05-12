const express = require('express');
const app = express();
const db = require('./db');

app.use(express.static('public'));
app.use(express.json());

app.post('/api/add-score', async (req, res) => {
    console.log('req.body: ', req.body);
    await db.insertScore(req.body);
    res.sendStatus(200);
});

app.get('/api/get-scores', async (req, res) => {
    const scores = await db.getScores();
    res.json(scores);
});

app.get('/api/reset', async (req, res) => {
    try {
        await db.resetScores();
        res.json({ success: true });
    } catch (error) {
        console.log('error: ', error);
        res.json({ success: false });
    }
});

app.listen(process.env.PORT || 8080, () => console.log("up and running..."));
