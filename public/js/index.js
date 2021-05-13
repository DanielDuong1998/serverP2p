
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
        console.log('block chain: ', blockChain.blockChain);
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

    socket.on('verifyBlockServer', block => {
        console.log('block receive from server: ', block);
        let index = block.index;
        let previousHash = block.previousHash;
        let timestamp = block.timestamp;
        let nonce = block.nonce;
        let difficulty = block.difficulty;
        let data = block.data;
        console.log('index: ', index);
        console.log('previousHash: ', previousHash);
        console.log('timestamp: ', timestamp);
        console.log('nonce: ', nonce);
        console.log('difficulty: ', difficulty);
        console.log('data: ', data);
        let hash = BestController.caculateHash(index, previousHash, timestamp, data, nonce, difficulty);
        let status = hashMatchesDifficulty(hash, difficulty);
        console.log('status: ', status);
        let hashLast = blockChain.blockChain[blockChain.blockChain.length - 1].hash;
        console.log('lasHas: ', hashLast);
        console.log('previousHash: ', previousHash);
        status = status && (hashLast === previousHash);
        socket.emit('resultVerifyBlock', ({ status, block }))
    })

    socket.on('addNewBlock', block => {
        blockChain.blockChain.push(block);
        console.log('block chain: ', blockChain.blockChain)
    })

    socket.on('mineSuccess', idUnspentSuccess => {
        console.log('idUnspent success: ', idUnspentSuccess);
        for (let i = 0; i < unspentTransaction.length; i++) {
            if (idUnspentSuccess == unspentTransaction[i].id) {
                unspentTransaction.splice(i, 1);
                i--;
                if (i < 0) i = 0;
            }
        }
    })

    socket.on('publicKeyServer', publicKey => {
        localStorage.setItem('publicKeyServer', publicKey);
        console.log('pk server: ', localStorage.getItem('publicKeyServer'))
        console.log('pk server 2: ', publicKey)
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
        document.getElementById("container").style.display = "none";
        document.getElementById("hp_container").style.display = "flex";

        localStorage.setItem('publicKey', data.data.publicKey);

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

const getTotalCoin = publicKey => {
    let blChain = blockChain.blockChain;

    let total = 0;
    for (let i = 0; i < blChain.length; i++) {
        if (blChain[i].data.txOut !== undefined && blChain[i].data.txOut.address !== undefined) {
            if (blChain[i].data.address == publicKey) {
                total -= blChain[i].data.txOut.amount;
            }


            if (publicKey == blChain[i].data.txOut.address) {
                total += blChain[i].data.txOut.amount;
            }


            if (blChain[i].data.minor == publicKey) {
                total += blChain[i].data.prize;
            }

        }
    }


    return total;

}

const checkHex = (n) => { return /^[0-9A-Fa-f]{1,64}$/.test(n) }

const hex2bin = (n) => {
    if (!checkHex(n)) return 0;
    return parseInt(n, 16).toString(2)
}

const hashMatchesDifficulty = (hash, difficulty) => {
    const h2b = hex2bin(hash);
    const requiredPrefix = '1'.repeat(difficulty);
    let rs = h2b.startsWith(requiredPrefix);
    return rs;
}

const mineCoin = _ => {
    if (unspentTransaction.length === 0) {
        document.getElementById("hp_msg").style.display = "block";

        return;
    }
    document.getElementById("hp_msg").style.display = "none";


    let length = blockChain.blockChain.length;
    let data = unspentTransaction[0];
    let timestamp = moment().valueOf();
    let index = blockChain.blockChain.length + 1;
    let previousHash = blockChain.blockChain[length - 1].hash;
    let difficulty = 10;

    data.minor = localStorage.getItem("publicKey");
    data.prize = 5;

    let addressSender = data.address;
    let addressServer = localStorage.getItem('publicKeyServer');
    console.log('addressServer: ', addressServer);

    if (addressSender != addressServer) {
        //check total coint with amount
        let coin = getTotalCoin(addressSender);
        let amount = data.txOut.amount;
        if (coin < amount) {
            //goi event huy verify giao dich
            return;
        }
    }

    let nonce = 0;
    while (true) {
        // for (let i = 0; i < 10000; i++) {
        const hash = BestController.caculateHash(index, previousHash, timestamp, data, nonce, difficulty);
        if (hashMatchesDifficulty(hash, difficulty)) {

            let d = {
                hash: hex2bin(hash),
                nonce: nonce
            }
            break;
        }
        console.log('hash')
        nonce++;
    }

    //tao block, gui server verify
    //server verify block
    //neu ok > 50% size, server xac nhan ok
    // lay ptu ra khoi unspent
    // add new Block
    const hashAf = BestController.caculateHash(index, previousHash, timestamp, data, nonce, difficulty);

    const block = new Block(index, previousHash, timestamp, data, difficulty, nonce, hashAf)
    socket.emit('verifyBlock', block);
    console.log('h2b ne: ', hex2bin(hashAf))

}

const updateUiRp = publicKey => {
    let blChain = blockChain.blockChain;

    let str = '';
    for (let i = 0; i < blChain.length; i++) {
        if (blChain[i].data.txOut !== undefined && blChain[i].data.txOut.address !== undefined) {
            let strA, strB;

            strA = blChain[i].data.address;
            strB = publicKey;
            if (strA == strB) {
                str += `<li>
                Gửi cho địa chỉ: ${blChain[i].data.txOut.address} <br>
                số lượng xu: ${blChain[i].data.txOut.amount} <br>
                vào lúc: ${moment(blChain[i].timestamp).format('YYYY-MM-DD HH:mm:ss')}
                </li>`;
            }

            strA = publicKey;
            strB = blChain[i].data.txOut.address;
            if (strA == strB) {
                str += `<li>
                Nhận từ địa chỉ: ${blChain[i].data.address} <br>
                số lượng xu: ${blChain[i].data.txOut.amount} <br>
                vào lúc: ${moment(blChain[i].timestamp).format('YYYY-MM-DD HH:mm:ss')}
                </li>`;
            }


            strA = blChain[i].data.minor.spl;
            strB = publicKey;
            if (strA == strB) {
                str += `<li>
                Đào được từ giao dịch có id: ${blChain[i].data.id} <br>
                số lượng xu: ${blChain[i].data.prize} <br>
                vào lúc: ${moment(blChain[i].timestamp).format('YYYY-MM-DD HH:mm:ss')}
                </li>`;
            }

        }
    }
    document.getElementById("rp_transaction").innerHTML = str;
}

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const sendCoin = (address, coin, privateKey) => {
    // console.log('sendcoin')
    const pubKeyStr = localStorage.getItem("publicKey");
    // let sign = new JSEncrypt();
    // sign.setPrivateKey(privateKey);
    // let signature = sign.sign('data', CryptoJS.SHA256, "sha256");
    // console.log('signature: ', signature);

    // let verify = new JSEncrypt();
    // verify.setPublicKey(pubKeyStr);
    // let verified = verify.verify('data', signature, CryptoJS.SHA256);
    // console.log('verified: ', verified)

    const txOut = {
        address: address,
        amount: coin
    }

    let sign = new JSEncrypt();
    sign.setPrivateKey(privateKey);
    let signature = sign.sign(JSON.stringify(txOut), CryptoJS.SHA256, "sha256");
    const txIn = {
        signature
    }

    const transaction = {
        id: uuid(),
        address: pubKeyStr,
        txIn,
        txOut
    }

    socket.emit('createTransacsion', transaction);


}

