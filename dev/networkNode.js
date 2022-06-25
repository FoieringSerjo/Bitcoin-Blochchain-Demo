const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const Blockchain = require('./blockchain');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const port = process.argv[2];
const nodeAddress = uuidv4().split('-').join('');
const BTC = new Blockchain();

app.get('/blockchain', function (req, res) {
  res.send(BTC);
});

app.post('/transaction', function (req, res) {
  const newTransaction = req.body;
  const blockIndex = BTC.addTransactionToPendingTransactions(newTransaction);
  res.json({ note: `Transaction will be added in block ${blockIndex}` });
});

app.post('/transaction/broadcast', function (req, res) {
  const amount = req.body.amount;
  const sender = req.body.sender;
  const recipient = req.body.recipient;

  const newTransaction = BTC.createNewTransaction(amount, sender, recipient);
  BTC.addTransactionToPendingTransactions(newTransaction);

  const requestPromises = [];
  BTC.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      url: networkNodeUrl + '/transaction',
      method: 'POST',
      data: newTransaction,
    };

    requestPromises.push(axios(requestOptions));
  });

  Promise.all(requestPromises).then((data) => {
    res.json({ note: 'Transaction created and broadcast successfully.' });
  });
});

app.get('/mine', function (req, res) {
  const lastBlock = BTC.getLastBlock();
  const previousBlockHash = lastBlock['hash'];

  const currentBlockData = {
    transactions: BTC.pendingTransactions,
    index: lastBlock['index'] + 1,
  };

  const nonce = BTC.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = BTC.hashBlock(previousBlockHash, currentBlockData, nonce);

  const newBlock = BTC.createNewBlock(nonce, previousBlockHash, blockHash);

  const requestPromises = [];
  BTC.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      url: networkNodeUrl + '/receive-new-block',
      method: 'POST',
      data: { newBlock: newBlock },
    };

    requestPromises.push(axios(requestOptions));
  });

  Promise.all(requestPromises)
    .then((data) => {
      const requestOptions = {
        url: BTC.currentNodeUrl + '/transaction/broadcast',
        method: 'POST',
        data: {
          amount: 12.5,
          sender: '00',
          recipient: nodeAddress,
        },
      };

      return axios(requestOptions);
    })
    .then((data) => {
      res.json({
        note: 'New block mined successfully & broadcast successfully.',
        block: newBlock,
      });
    });
});

app.post('/receive-new-block', (req, res) => {
  const newBlock = req.body.newBlock;
  const lastBlock = BTC.getLastBlock();
  const correctHash = lastBlock.hash === newBlock.previousBlockHash;
  const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

  if (correctHash && correctIndex) {
    BTC.chain.push(newBlock);
    BTC.pendingTransactions = [];
    res.json({
      note: 'New block received and accepted.',
      newBlock,
    });
  } else {
    res.json({
      note: 'New block rejected.',
      newBlock,
    });
  }
});

// register a node and broadcast it the network
app.post('/register-and-broadcast-node', (req, res) => {
  const newNodeUrl = req.body.newNodeUrl;
  if (BTC.networkNodes.indexOf(newNodeUrl) === -1) {
    BTC.networkNodes.push(newNodeUrl);
  }

  const regNodes = [];
  BTC.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      url: networkNodeUrl + '/register-node',
      method: 'POST',
      data: { newNodeUrl: newNodeUrl },
    };

    regNodes.push(axios(requestOptions));
  });

  Promise.all(regNodes)
    .then((data) => {
      const bulkRegisterOptions = {
        url: newNodeUrl + '/register-nodes-bulk',
        method: 'POST',
        data: { allNetworkNodes: [...BTC.networkNodes, BTC.currentNodeUrl] },
      };

      return axios(bulkRegisterOptions);
    })
    .then((data) => {
      res.json({ note: 'New node registered with network successfully.' });
    });
});

// register a node with the network
app.post('/register-node', (req, res) => {
  const newNodeUrl = req.body.newNodeUrl;
  const nodeNotAlreadyPresent = BTC.networkNodes.indexOf(newNodeUrl) === -1;
  const notCurrentNode = BTC.currentNodeUrl !== newNodeUrl;
  if (nodeNotAlreadyPresent && notCurrentNode) {
    BTC.networkNodes.push(newNodeUrl);
  }

  res.json({ node: 'New node registered successfully.' });
});

// register multiple nodes at once
app.post('/register-nodes-bulk', (req, res) => {
  const allNetworkNodes = req.body.allNetworkNodes;
  allNetworkNodes.forEach((networkNodeUrl) => {
    const nodeNotAlreadyPresent = BTC.networkNodes.indexOf(networkNodeUrl) === -1;
    const notCurrentNode = BTC.currentNodeUrl !== networkNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNode) {
      BTC.networkNodes.push(networkNodeUrl);
    }
  });
  res.json({ note: 'Bulk registration successful.' });
});

app.get('/consensus', function (req, res) {
  // debugger;
  const requestPromises = [];
  BTC.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      url: networkNodeUrl + '/blockchain',
      method: 'GET',
    };

    requestPromises.push(axios(requestOptions));
  });

  Promise.all(requestPromises).then((responses) => {
    const currentChainLength = BTC.chain.length;
    let maxChainLength = currentChainLength;
    let newLongestChain = null;
    let newPendingTransactions = null;
    responses.forEach(({ data: blockchain }) => {
      if (blockchain.chain.length > maxChainLength) {
        maxChainLength = blockchain.chain.length;
        newLongestChain = blockchain.chain;
        newPendingTransactions = blockchain.pendingTransactions;
      }
    });
    if (!newLongestChain || (newLongestChain && !BTC.chainIsValid(newLongestChain))) {
      res.json({
        note: 'Current chain has not been replaced.',
        chain: BTC.chain,
      });
    } else {
      BTC.chain = newLongestChain;
      BTC.pendingTransactions = newPendingTransactions;
      res.json({
        note: 'This chain has been replaced.',
        chain: BTC.chain,
      });
    }
  });
});

app.get('/block/:blockHash', function (req, res) {
  const blockHash = req.params.blockHash;
  const correctBlock = BTC.getBlock(blockHash);
  res.json({
    block: correctBlock,
  });
});

app.get('/transaction/:transactionId', function (req, res) {
  const transactionId = req.params.transactionId;
  const transactionData = BTC.getTransaction(transactionId);
  res.json(transactionData);
});

app.get('/address/:address', function (req, res) {
  const address = req.params.address;
  const addressData = BTC.getAddressData(address);
  res.json(addressData);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
