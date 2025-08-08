// bot.js
const mineflayer = require('mineflayer');

const config = {
  host: 'AidensServer.aternos.me',      // change to your server address
  port: 51889,            // change if needed
  username: 'AntiAFK_Bot1',
  version: '1.20.1',      // fixed to 1.20.1
  jumpIntervalMs: 20000,  // how often to jump (20s default)
  jumpHoldMs: 200         // how long to hold jump (ms)
};

let reconnectDelayMs = 5000; // wait before reconnecting

function createBot() {
  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version
  });

  let jumpTimer = null;

  bot.once('spawn', () => {
    console.log('Bot spawned — starting AFK jump loop.');

    if (jumpTimer) clearInterval(jumpTimer);

    jumpTimer = setInterval(() => {
      if (!bot.entity || bot.health === undefined) return;

      try {
        bot.setControlState('jump', true);
        setTimeout(() => {
          bot.setControlState('jump', false);
        }, config.jumpHoldMs);
      } catch (err) {
        console.warn('Jump attempt error:', err && err.message);
      }
    }, config.jumpIntervalMs);
  });

  bot.on('end', (reason) => {
    console.log('Disconnected:', reason);
    if (jumpTimer) { clearInterval(jumpTimer); jumpTimer = null; }
    setTimeout(createBot, reconnectDelayMs);
  });

  bot.on('error', (err) => {
    console.error('Bot error:', err && err.message);
  });

  bot.on('chat', (username, message) => {
    console.log(`<${username}> ${message}`);
  });

  process.on('SIGINT', () => {
    console.log('Shutting down bot...');
    if (jumpTimer) clearInterval(jumpTimer);
    try { bot.quit('Bot shutting down'); } catch (e) {}
    process.exit();
  });
}

createBot();
