const express = require('express');
const app = express();
const user_inform = require('./routes/user_inform');
const game = require('./routes/game')
const server = require('http').createServer(app);
const io = require('socket.io')(server, {cors : {
    origin : "*",
    pingTimeout: 1000,
    pingInterval: 5000
}});
const fs = require('fs')
 
app.use('/api/user_inform', user_inform);
app.use('/api/game', game);
 
const port = 5000;

io.listen(5001, () => console.log(`Socket Server listening at port 5001`));
app.listen(port, () => console.log(`Node.js Server is running on port ${port}...`));

async function dataSave(data, name) {
    const datastr = JSON.stringify(data, null, '\t');
    fs.writeFileSync(`./data/${name}.json`, datastr);
}

const sleep = (ms) => {
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

var connection = false  

io.on('connection', (socket) => {
    // when the client emits 'add user', this listens and executes
    socket.on('userConnect', (data) => {
        connection = true
        var dataBuffer = fs.readFileSync('./data/Games.json')
        var dataJSON = dataBuffer.toString()
        var Games = JSON.parse(dataJSON)

        dataBuffer = fs.readFileSync('./data/userData.json')
        dataJSON = dataBuffer.toString()
        var userData = JSON.parse(dataJSON)

        if(!(data.gameId in Games))
        {
            return 0
        }

        socket.uid = data.uid
        socket.username = userData.Users[data.uid].username
        socket.gameId = data.gameId

        if(!(data.uid in Games[data.gameId]?.players))
        {
            Games[data.gameId].players[data.uid] = {
                name: userData.Users[data.uid].username,
                isHost: false,
                isReady: false
            }
        }

        dataSave(Games, 'Games')

        socket.join(socket.gameId)
        
        socket.emit('login', {
            chat: Games[data.gameId].chat,
            room: Games[data.gameId].name,
            isHost: (Games[data.gameId].host === data.uid),
            isReady: Games[data.gameId].players[data.uid].isReady,
            state: Games[data.gameId].state,
            board: Games[data.gameId].board,
            users: Games[data.gameId].players,
            turn: Games[data.gameId].cntTurn
        })
        io.to(socket.gameId).emit('userUpdate', {
            users: Games[data.gameId].players
        });
    })

    socket.on('disconnect', async(data) => {
        connection = false
        await sleep(1000)
        if(connection !== true)
        {
            socket.leave(socket.gameId)

            var dataBuffer = fs.readFileSync('./data/Games.json')
            var dataJSON = dataBuffer.toString()
            var Games = JSON.parse(dataJSON)

            dataBuffer = fs.readFileSync('./data/userData.json')
            dataJSON = dataBuffer.toString()
            var userData = JSON.parse(dataJSON)

            
            if(Games[socket.gameId]?.players !== undefined)
            {
                delete Games[socket.gameId].players[socket.uid]
                dataSave(Games, 'Games')

                if(Object.keys(Games[socket.gameId].players).length === 0)
                {
                    delete Games[socket.gameId]
                    dataSave(Games, 'Games')
                }
                else if(socket.uid === Games[socket.gameId].host)
                {
                    Games[socket.gameId].host = Number(Object.keys(Games[socket.gameId].players)[0])
                    Games[socket.gameId].players[Games[socket.gameId].host].isHost = true
                    dataSave(Games, 'Games')
                }
                else
                {
                    io.to(socket.gameId).emit('userUpdate', {
                        users: Games[socket.gameId].players,
                        host: Games[socket.gameId].host
                    });
                }
            }
        }
    })

    socket.on('createNewMessage', (data) => {
        var dataBuffer = fs.readFileSync('./data/Games.json')
        var dataJSON = dataBuffer.toString()
        var Games = JSON.parse(dataJSON)

        Games[socket.gameId].chat.push({
            msg : data,
            username: socket.username
        })

        dataSave(Games, 'Games')

        io.to(socket.gameId).emit('newMessage', {
            chat: Games[socket.gameId].chat
        });
    })

    socket.on('userReady', (data) => {
        var dataBuffer = fs.readFileSync('./data/Games.json')
        var dataJSON = dataBuffer.toString()
        var Games = JSON.parse(dataJSON)

        Games[socket.gameId].players[socket.uid].isReady = data
        dataSave(Games, 'Games')

        io.to(socket.gameId).emit('userUpdate', {
            users: Games[socket.gameId].players
        });
    })

    socket.on('gameStart', (data) => {
        var dataBuffer = fs.readFileSync('./data/Games.json')
        var dataJSON = dataBuffer.toString()
        var Games = JSON.parse(dataJSON)

        Games[socket.gameId].state = 1
        Games[socket.gameId].cntTurn = Object.keys(Games[socket.gameId].players)[0]
        dataSave(Games, 'Games')
        io.to(socket.gameId).emit('stateUpdate', {
            state: 1,
            turn: Object.keys(Games[socket.gameId].players)[0]
        });
    })

    socket.on('boardUpdate', (data) => {
        var dataBuffer = fs.readFileSync('./data/Games.json')
        var dataJSON = dataBuffer.toString()
        var Games = JSON.parse(dataJSON)

        var x = data.pos.x
        var y = data.pos.y

        // 가로,  y=-x, 세로, y=x 
        var tmp = [0, 0, 0, 0]
        var ap = [[[-1, 0], [1, 0]], [[-1, -1], [1, 1]], [[0, -1], [0, 1]], [[-1, 1], [1, -1]]]

        ap.map((type, index) => {
            for(var dir of type)
            {
                var cntX = x + dir[0]
                var cntY = y + dir[1]
                while(data.board[cntX][cntY] === data.pl)
                {
                    cntX += dir[0]
                    cntY += dir[1]
                    tmp[index]++
                }
                if(tmp[index] >= 4)
                {
                    io.to(socket.gameId).emit('winnerChecked', {
                        board: Games[socket.gameId].board,
                        winner: Games[socket.gameId].players[Games[socket.gameId].cntTurn].name,
                        turn : Games[socket.gameId].cntTurn
                    });
                    return
                }
            }
        })

        var index = Object.keys(Games[socket.gameId].players).indexOf(Games[socket.gameId].cntTurn)

        if(index === (Object.keys(Games[socket.gameId].players).length -1))
        {
            index = 0
        }
        else
        {
            index += 1
        }

        Games[socket.gameId].cntTurn = Object.keys(Games[socket.gameId].players)[index]
        Games[socket.gameId].board = data.board
        dataSave(Games, 'Games')

        io.to(socket.gameId).emit('boardUpdate', {
            board: Games[socket.gameId].board,
            turn : Games[socket.gameId].cntTurn
        });
    })

})