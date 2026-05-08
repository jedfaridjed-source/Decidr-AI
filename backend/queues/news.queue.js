const { Queue } = require('bullmq');

const newsQueue = new Queue('newsQueue', {
  connection: {
    host: '127.0.0.1',
    port: 6379
  },
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 3
  }
});

module.exports = newsQueue;