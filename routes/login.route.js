const express = require('express');
const db = require('../db/db')

const router = express.Router();

router.post('/', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const ret = db.get('user').find({ username }).value();
    if (ret === undefined) return res.json({
        status: -1,
        msg: 'authenticated failed!'
    });

    if (password !== ret.password) {
        return res.json({
            status: -1,
            msg: 'authenticated failed!'
        });
    }

    res.json({
        status: 1,
        data: ret
    })
})


module.exports = router;