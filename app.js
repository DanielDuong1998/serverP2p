const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', 'views');

const server = require('http').Server(app);
var io = require('socket.io')(server);

io.on('connection', socket => {
    console.log('id ', socket.id, ' connect');
    socket.on('hello', msg => {
        console.log('msg: ', msg);
        io.emit('serverSend', `hello id: ${socket.id}`);
    })

    socket.on('disconnect', _ => {
        console.log('id: ', socket.id, ' disconnect');
    })

    socket.on("sendData", data => {
        const id = data.id;
        const msg = data.msg;
        const dt = JSON.stringify({ id: data.id, data: data.msg })
        console.log('dt: ', dt);
        io.to(`${id}`).emit('p2p', ({ id, msg }));
    })
})

const handleEvent = _ => {
    console.log('handle event');
}

app.get('/', (req, res) => {
    res.render('index');
})

const PORT = 3000;
server.listen(PORT, _ => {
    console.log(`server is running at localhost:${PORT}`);
})