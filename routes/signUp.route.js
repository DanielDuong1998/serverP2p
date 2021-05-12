const express = require('express');
const db = require('../db/db')
const NodeRSA = require('node-rsa');


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

    const key = new NodeRSA({ b: 2048 });
    const publicKey = key.exportKey('public');
    const privateKey = key.exportKey('private');

    const data = ({
        index: size + 1,
        username,
        password,
        publicKey,
        privateKey
    })

    db.get('user').push({ index: size + 1, username, password, publicKey }).write();
    res.json({
        status: 1,
        data
    })

})

const checkUsername = username => {
    const ret = db.get('user').find({ username }).value();
    if (ret === undefined) return true;
    return false;
}

module.exports = router;