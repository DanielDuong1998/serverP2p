let socket = io("http://localhost:3000");
let blockChain;
let unspentTransaction;
window.onload = _ => {
    blockChain = new BlockChain();
    unspentTransaction = [];

    socket.on('serverSend', msg => {
        console.log('server: ', msg);
    })
    socket.on('p2p', data => {
        console.log('id: ', data.id);
        console.log('msg: ', data.msg);
    })

    // start blockchain
    socket.on('serverSendBlockChain', data => {
        if (data !== "") blockChain.blockChain = data;
    })

    socket.on('serverNeedBlockChain', id => {
        const data = ({
            id,
            blockChain: blockChain.blockChain
        })
        socket.emit('clientSendBlockChain', data);
    })
    //end blockchain

    //start unspentTransaction
    socket.on('serverSendUnspentTransaction', data => {
        if (data !== "") unspentTransaction = data;
        console.log("usp tran ne: ", unspentTransaction)

    })

    socket.on('serverNeedUnspentTransaction', id => {
        const data = ({
            id,
            unspentTransaction: unspentTransaction
        })
        socket.emit('clientSendUnspentTransaction', data);
    })

    socket.on('newTransaction', transaction => {
        unspentTransaction.push(transaction);
        console.log("usp tran new: ", unspentTransaction)
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
        socket.emit('getBlockChain', '');
        socket.emit('getUnspentTransaction', '');
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
        if (data.status === 1) {
            console.log('data: ', data.data);
            let txtPublickey = document.getElementById("su_publicKey");
            let txtPrivateKey = document.getElementById("su_privateKey");
            document.getElementById("su_desc").style.display = "block";

            txtPublickey.style.display = "block";
            txtPrivateKey.style.display = "block";
            console.log('pl: ', data.publicKey)
            txtPublickey.innerHTML = `Địa chỉ ví: ${data.data.publicKey}`;
            txtPrivateKey.innerHTML = `Private key: ${data.data.privateKey}`;

            localStorage.setItem("publicKey", data.data.publicKey);
            localStorage.setItem("privateKey", data.data.privateKey);
        }
        else {
            let ms = document.getElementById("su_msg");
            ms.style.display = "block";
            ms.innerHTML = "Tên đăng nhập đã tồn tại";
        }

    })
}