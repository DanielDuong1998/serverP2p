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
    console.log('signup')
    const data = ({
        username, password
    })

    $.ajax({
        url: './signup',
        method: 'post',
        dataType: 'json',
        data
    }).done(data => {
        console.log('data: ', data);
    })
}