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
    const data = ({
        username, password
    })

    $.ajax({
        url: './login',
        method: 'post',
        dataType: 'json',
        data
    }).done(data => {
        if (data.status == -1) {
            console.log(data.msg);
            return;
        }

        console.log("data: ", data.data);
        socket.emit('login', data.data.publicKey);
    })
}

const signup = async (username, password) => {
    const data = ({
        username, password
    })

    $.ajax({
        url: './signup',
        method: 'post',
        dataType: 'json',
        data
    }).done(data => {
        console.log('data: ', data.data);
        let txtPublickey = document.getElementById("su_publicKey");
        let txtPrivateKey = document.getElementById("su_privateKey");
        document.getElementById("su_desc").style.display = "block";

        txtPublickey.style.display = "block";
        txtPrivateKey.style.display = "block";
        console.log('pl: ', data.publicKey)
        txtPublickey.innerHTML = `Địa chỉ ví: ${data.data.publicKey}`;
        txtPrivateKey.innerHTML = `Private key: ${data.data.privateKey}`;

        localStorage.setItem("publicKey", publicKey);
        localStorage.setItem("privateKey", privateKey);
    })
}