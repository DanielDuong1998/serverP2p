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
    console.log('sign up');
    let block = new Block(1, 'asdfasdf', 123234234, 'dfasdf', 2, 23423, 'asdfajsdfkal');
    let hashne = BestController.caculateHash(1, 'asdfasdf', 123234234, 'dfasdf', 2, 23423);
    console.log('hash: ', hashne)
}