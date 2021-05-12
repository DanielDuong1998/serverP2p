const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');


const app = express();
app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', 'views');
const server = require('http').Server(app);
var io = require('socket.io')(server);
app.set('io', io);


var listUser = [];

io.on('connection', socket => {
    console.log('id ', socket.id, ' connect');
    socket.on('hello', msg => {
        console.log('msg: ', msg);
        io.emit('serverSend', `hello id: ${socket.id}`);
    })

    socket.on('disconnect', _ => {
        console.log('id: ', socket.id, ' disconnect');
        for (let i = 0; i < listUser.length; i++) {
            if (socket.id == listUser[i].id) {
                listUser.splice(i, 1);
                i--;
                if (i < 0) i = 0;
            }
        }


    })

    socket.on('login', publicKey => {
        listUser.push({ id: socket.id, publicKey })
        console.log('arr: ', listUser);
    })

    socket.on('getBlockChain', data => {
        if (listUser.length === 1) {
            socket.emit('serverSendBlockChain', '');
            return;
        }

        for (let i = 0; i < listUser.length; i++) {
            if (listUser[i].id != socket.id) {
                io.to(listUser[i].id).emit('serverNeedBlockChain', socket.id);
                return;
            }
        }

    })

    socket.on('clientSendBlockChain', data => {
        let id = data.id;
        let blockChain = data.blockChain;
        io.to(id).emit('serverSendBlockChain', blockChain);
    })

    socket.on('getUnspentTransaction', data => {
        if (listUser.length === 1) {
            socket.emit('serverSendUnspentTransaction', '');
            return;
        }

        for (let i = 0; i < listUser.length; i++) {
            if (listUser[i].id != socket.id) {
                io.to(listUser[i].id).emit('serverNeedUnspentTransaction', socket.id);
                return;
            }
        }
    })

    socket.on('clientSendUnspentTransaction', data => {
        let id = data.id;
        let transaction = data.unspentTransaction;
        io.to(id).emit('serverSendUnspentTransaction', transaction);
    })

})

const handleEvent = _ => {
    console.log('handle event');
}

app.get('/', (req, res) => {
    res.render('index');
})

app.use('/signup', require('./routes/signUp.route'));
app.use('/login', require('./routes/login.route'));

const PORT = 3000;
server.listen(PORT, _ => {
    console.log(`server is running at localhost:${PORT}`);
})