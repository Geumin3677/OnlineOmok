const express = require('express');
const router = express.Router();
const fs = require('fs')

async function dataSave(data, name) {
    const datastr = JSON.stringify(data, null, '\t');
    fs.writeFileSync(`./data/${name}.json`, datastr);
}
 
router.post('/login', (req, res) => {
	var dataBuffer = fs.readFileSync('./data/userData.json')
    var dataJSON = dataBuffer.toString()
    var userData = JSON.parse(dataJSON)

    const id = req.query.id
    const pw = req.query.pw

    var x = false
    var y = false
    var z

    for(const a of userData.Users)
    {
        if(a.id === id)
        {
            x = true
            if(a.pw === pw)
            {
                y = true
                z = {
                    uid: a.uid,
                    id: a.id,
                    username: a.username
                }
                break
            }
        }
    }

    if(x)
    {
        if(y)
        {
            res.send({res: z})
        }
        else
        {
            res.send({res: 1})
        }
    }
    else
    {
        res.send({res: 0})
    }
});

router.post('/signup', (req, res) => {
    const id = req.query.id
    const pw = req.query.pw
    const username = req.query.Username

    var dataBuffer = fs.readFileSync('./data/userData.json')
    var dataJSON = dataBuffer.toString()
    var userData = JSON.parse(dataJSON)

    userData.Users.push({
        username : username,
        id : id,
        pw : pw,
        uid : userData.Users.length
    })

    dataSave(userData, 'userData')

    res.send({
        uid: (userData.Users.length - 1),
        id: id,
        username: username
    })

});
 
module.exports = router;