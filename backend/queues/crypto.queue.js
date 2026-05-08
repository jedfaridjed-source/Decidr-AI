const { Queue } = require('bullmq');

module.exports = new Queue('cryptoQueue', {
  connection: {
    host: '127.0.0.1',
    port: 6379
  }
});