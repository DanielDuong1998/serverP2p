class BlockChain {
    constructor() {
        this.blockChain = [];

        let currentTime = moment().valueOf();
        let hash = BestController.caculateHash(1, '0', currentTime, "genesis block of Daniel", 0, 0);

        this.blockChain.push(new Block(0, '0', currentTime, "genesis block of Daniel", 0, 0, hash))
    }
}