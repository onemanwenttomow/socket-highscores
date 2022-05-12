const express = require('express');
const app = express();
const server = require('http').Server(app);
const db = require('./db');
const io = require('socket.io')(server, {
    allowRequest: (req, callback) =>
        callback(
            null,
            req.headers.referer.startsWith("http://localhost:8080") || req.headers.referer.startsWith("https://sockets-leaderboard.herokuapp.com/")
        )
});

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

server.listen(process.env.PORT || 8080, () => console.log("up and running...")); // it's server, not app, that does the listening

io.on('connection', async function (socket) {
    console.log(`socket with the id ${socket.id} is now connected`);
    const scores = await db.getScores();
    socket.emit("leaderboard", scores)

    socket.on('addScore', async (score) => {
        await db.insertScore(score);
        const scores = await db.getScores();
        console.log('scores: ', scores.length);
        console.log('about to emit...');
        io.emit("leaderboard", scores)
    })
});
