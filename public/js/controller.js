const BestController = {
    caculateHash(index, previousHash, timestamp, data, nonce, difficulty) {
        let hash = CryptoJS.SHA256(index + previousHash + timestamp + data + nonce + difficulty).toString();
        return hash;
    }
}