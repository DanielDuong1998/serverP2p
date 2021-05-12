const express = require('express');
const db = require('../db/db')
const NodeRSA = require('node-rsa');
const rsa = require('../db/rsa');
const { v4: uuidv4 } = require('uuid');


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
    if (size + 1 <= 10) {
        //tao transaction + 1000 coin
        const svPublicKey = rsa.publicKey();
        const svPrivateKey = rsa.privateKey();
        const priRsa = new NodeRSA(svPrivateKey);
        const pubRsa = new NodeRSA(svPublicKey);
        // console.log('svPub: ', svPublicKey);
        // console.log('svPri: ', svPrivateKey);
        var io = req.app.get('io');

        const txOut = {
            address: publicKey,
            amount: 1000
        }
        const sign = priRsa.sign(JSON.stringify(txOut), 'base64', 'utf8');
        // console.log('sign: ', sign);
        // const verify = pubRsa.verify(JSON.stringify(txOut), sign, 'utf8', 'base64');
        // console.log('verify: ', verify);
        const txIn = {
            signature: sign
        }


        const transaction = {
            id: uuidv4(),
            address: svPublicKey,
            txIn,
            txOut
        }


        var listUser = req.app.get('listUser');
        if (listUser.length === 0) {
            var unspentServer = req.app.get('unspentServer');
            unspentServer.push(transaction);
        }
        else {
            for (let i = 0; i < listUser.length; i++) {
                console.log('id to emit: ', listUser[i].id)
                io.to(listUser[i].id).emit('newTransaction', transaction);
            }
        }



        //broadcast transaction
    }
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