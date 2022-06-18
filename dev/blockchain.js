const sha256 = require('sha256');

// class Blockchain {
//   constructor() {
//     this.chain = [];
//     this.pendingTransactions = [];
//   }

//   //methods
// }

function Blockchain() {
  this.chain = [];
  this.pendingTransactions = [];

  this.createNewBlock(100, '0', '0');
}

Blockchain.prototype.createNewBlock = function (nonce, previousBlackHash, hash) {
  const newBlock = {
    index: this.chain.length + 1,
    timestamp: Date.now(),
    transactions: this.pendingTransactions,
    nonce,
    hash,
    previousBlackHash,
  };
  this.pendingTransactions = [];
  this.chain.push(newBlock);

  return newBlock;
};

Blockchain.prototype.getLastBlock = function () {
  return this.chain[this.chain.length - 1];
};

Blockchain.prototype.createNewTransaction = function (amount, sender, recipient) {
  const newTransaction = {
    amount,
    sender,
    recipient,
  };
  this.pendingTransactions.push(newTransaction);

  return this.getLastBlock()['index'] + 1;
};

/**
 *
 * @param {string} previousBlackHash
 * @param {Array} currentBlockData - Array of objects
 * @param {number} nonce
 * @returns {string} Hash of all data inserted above
 */
Blockchain.prototype.hashBlock = function (previousBlackHash, currentBlockData, nonce) {
  const dataAsString = previousBlackHash + nonce.toString() + JSON.stringify(currentBlockData);
  const hash = sha256(dataAsString);
  return hash;
};

Blockchain.prototype.proofOfWork = function (previousBlackHash, currentBlockData) {
  // => repeatedly hash block until it finds correct hash => '0000IOJNKLNMASD98'
  // => uses current block data for the hash, but also the previousBlackHash
  // => continuosly changes nonce vaule until it finds the correct hash
  // => returns to us the nonce value that creates the correct hash

  let nonce = 0;
  let hash = this.hashBlock(previousBlackHash, currentBlockData, nonce);
  while (hash.substring(0, 4) !== '0000') {
    nonce++;
    hash = this.hashBlock(previousBlackHash, currentBlockData, nonce);
    // console.log(hash);
  }
  return nonce;
};

module.exports = Blockchain;
