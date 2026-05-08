const cron = require('node-cron');
const newsQueue = require('../queues/news.queue');

cron.schedule('*/20 * * * *', async () => {
  console.log('🟡 CRON FIRED');

  const job = await newsQueue.add('ingest-news', {
    triggeredAt: Date.now()
  });

  console.log('🟢 JOB CREATED:', job.id);
});