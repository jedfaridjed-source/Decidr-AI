const cron = require('node-cron');
const cryptoQueue = require('../queues/crypto.queue');

// 🔥 every 5 minutes (good for crypto)
cron.schedule('*/1 * * * *', async () => {
  console.log('🟡 CRYPTO CRON FIRED');

  try {
    const job = await cryptoQueue.add('update-crypto', {
      triggeredAt: Date.now()
    });

    console.log('🟢 CRYPTO JOB CREATED:', job.id);

  } catch (err) {
    console.error('❌ CRON ERROR:', err.message);
  }
});