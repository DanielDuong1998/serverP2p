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

var listUser = [];

io.on('connection', socket => {
    console.log('id ', socket.id, ' connect');
    socket.on('hello', msg => {
        console.log('msg: ', msg);
        io.emit('serverSend', `hello id: ${socket.id}`);
    })

    socket.on('disconnect', _ => {
        console.log('id: ', socket.id, ' disconnect');
    })

    socket.on('login', publicKey => {
        listUser.push({ id: socket.id, publicKey })
        console.log('arr: ', listUser);
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