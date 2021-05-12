const express = require('express');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db/user.json');
const db = low(adapter);

db.defaults({
    user: []
}).write();

const router = express.Router();

router.get('/', (req, res) => {
    res.render('signup');
})

router.post('/', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const ret = checkUsername(username);
    if (!ret) {
        return res.json({
            status: -1,
            msg: 'username invalid'
        });
    }

    let size = db.get('user').size().value();
    db.get('user').push({ index: size + 1, username, password }).write();
    res.json({
        status: 1,
        msg: 'done'
    })

})

const checkUsername = username => {
    const ret = db.get('user').find({ username }).value();
    if (ret === undefined) return true;
    return false;
}

module.exports = router;