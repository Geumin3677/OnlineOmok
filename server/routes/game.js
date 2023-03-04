const express = require('express');
const router = express.Router();
const fs = require('fs')

async function dataSave(data, name) {
    const datastr = JSON.stringify(data, null, '\t');
    fs.writeFileSync(`./data/${name}.json`, datastr);
}
 
router.post('/createRoom', (req, res) => {
    var dataBuffer = fs.readFileSync('./data/Games.json')
    var dataJSON = dataBuffer.toString()
    var Games = JSON.parse(dataJSON)

    var gameid = Math.random().toString(36).substr(2, 16)
    while(gameid in Games)
    {
        gameid = Math.random().toString(36).substr(2, 16)
    }

    Games[gameid] = {
        name: req.query.name,
        state: 0,
        host: Number(req.query.user.uid),
        cntTurn : -1,
        players: {
            [req.query.user.uid] : {
                name: req.query.user.username,
                isHost: true,
                isReady: false
            }
        },
        board: Array(19).fill(Array(19).fill(0)),
        chat: []
    }

    dataSave(Games, 'Games')

    res.send(gameid)
})

router.post('/checkRoom', (req, res) => {
    var dataBuffer = fs.readFileSync('./data/Games.json')
    var dataJSON = dataBuffer.toString()
    var Games = JSON.parse(dataJSON)

    if(req.query.id in Games)
    {
        res.send(true)
    }
    else
    {
        res.send(false)
    }
})

module.exports = router;