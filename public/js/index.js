let socket = io("http://localhost:3000");
window.onload = _ => {
    socket.on('serverSend', msg => {
        console.log('server: ', msg);
    })
    socket.on('p2p', data => {
        console.log('id: ', data.id);
        console.log('msg: ', data.msg);
    })
}

const login = (username, password) => {

}

const signup = async (username, password) => {

}