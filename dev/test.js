const Blockchain = require('./blockchain');
const bitcoin = new Blockchain();

const BTC1 = {
  'chain': [
    {
      'index': 1,
      'timestamp': 1655988423338,
      'transactions': [],
      'nonce': 100,
      'hash': '0',
      'previousBlockHash': '0',
    },
    {
      'index': 2,
      'timestamp': 1655988460049,
      'transactions': [
        {
          'amount': 10,
          'sender': 'MAMAMAHAHAHAPPPP',
          'recipient': 'JHHDUUDDUDUUUUUD',
          'transactionId': 'e75130c2ce664ff98e6f818e6cbfd76e',
        },
        {
          'amount': 20,
          'sender': 'MAMAMAHAHAHAPPPP',
          'recipient': 'JHHDUUDDUDUUUUUD',
          'transactionId': '8bf4f4dce8ab40cd8101535f2934e7cb',
        },
        {
          'amount': 30,
          'sender': 'MAMAMAHAHAHAPPPP',
          'recipient': 'JHHDUUDDUDUUUUUD',
          'transactionId': 'a9004f93e04f49e19768ec4eec6b2d23',
        },
      ],
      'nonce': 15861,
      'hash': '0000891a9837c9313c53b3597f2c9ac116c2e14398b51858caefe898e6d01627',
      'previousBlockHash': '0',
    },
    {
      'index': 3,
      'timestamp': 1655988475565,
      'transactions': [
        {
          'amount': 12.5,
          'sender': '00',
          'recipient': '0d9b2c07a8134e27ac48fe566252061e',
          'transactionId': '94a288dd21ca410682b593029656a40f',
        },
        {
          'amount': 40,
          'sender': 'MAMAMAHAHAHAPPPP',
          'recipient': 'JHHDUUDDUDUUUUUD',
          'transactionId': 'c870b1b9df29491cb2a0d86a62ae50ac',
        },
        {
          'amount': 50,
          'sender': 'MAMAMAHAHAHAPPPP',
          'recipient': 'JHHDUUDDUDUUUUUD',
          'transactionId': 'f2f223a6141947ceb4d5c3f510c4bad9',
        },
      ],
      'nonce': 157791,
      'hash': '0000d284bea1eb3f34db6ab0c7a31dc9a31458890a658ee1f6726677706b7038',
      'previousBlockHash': '0000891a9837c9313c53b3597f2c9ac116c2e14398b51858caefe898e6d01627',
    },
  ],
  'pendingTransactions': [
    {
      'amount': 12.5,
      'sender': '00',
      'recipient': '0d9b2c07a8134e27ac48fe566252061e',
      'transactionId': '7feaf0a78141441c90246e77f7ed9db9',
    },
  ],
  'currentNodeUrl': 'http://localhost:3001',
  'networkNodes': [],
};

console.log('VALID: ', bitcoin.chainIsValid(BTC1.chain));
