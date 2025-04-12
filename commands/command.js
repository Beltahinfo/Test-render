const { keith } = require('../keizzah/keith');
const Heroku = require('heroku-client');
const settings = require("../set");
const axios = require("axios");
const speed = require("performance-now");
const { exec } = require("child_process");
const { repondre } = require(__dirname + "/../keizzah/context");

const fgg = {
  key: {
    fromMe: false,
    participant: `0@s.whatsapp.net`,
    remoteJid: 'status@broadcast',
  },
  message: {
    contactMessage: {
      displayName: `BELTAH MD`,
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;BELTAH MD;;;\nFN:BELTAH MD\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
    },
  },
};

// Function to format runtime into a clean string
function formatRuntime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsLeft = Math.floor(seconds % 60);
  return `*${hours}h ${minutes}m ${secondsLeft}s*`;
}

// Ping command
keith(
  {
    nomCom: 'on',
    aliases: ['speed', 'latency'],
    desc: 'To check bot response time',
    categorie: 'system',
    reaction: '👻',
    fromMe: true,
  },
  async (dest, zk) => {
    try {
      const start = Date.now();
      await zk.sendPresenceUpdate('composing', dest); // Simulate typing
      const latency = Date.now() - start;

      const pingMessage = `*📡 PING RESULTS 📡*\n\n` +
                          `*🌐 Latency:* ${latency}ms\n` +
                          `*⚡ Powered by BELTAH Tech Team*`;

      await zk.sendMessage(
        dest,
        { text: pingMessage, contextInfo: { mentionedJid: [fgg.key.participant] } },
        { quoted: fgg }
      );
    } catch (error) {
      console.error(`Error in ping command: ${error.message}`);
      await zk.sendMessage(dest, {
        text: `⚠️ An error occurred while processing the ping command. Please try again later.`,
      });
    }
  }
);

// Uptime command
keith(
  {
    nomCom: 'active',
    aliases: ['runtime', 'running'],
    desc: 'To check runtime',
    categorie: 'system',
    reaction: '⚠️',
    fromMe: true,
  },
  async (dest, zk) => {
    try {
      const botUptime = process.uptime(); // Get bot uptime in seconds
      const formattedUptime = formatRuntime(botUptime);

      const uptimeMessage = `*⏰ BOT UPTIME ⏰*\n\n` +
                            `*🛸 Uptime:* ${formattedUptime}\n` +
                            `*⚡ Powered by BELTAH Tech Team*`;

      await zk.sendMessage(
        dest,
        { text: uptimeMessage, contextInfo: { mentionedJid: [fgg.key.participant] } },
        { quoted: fgg }
      );
    } catch (error) {
      console.error(`Error in uptime command: ${error.message}`);
      await zk.sendMessage(dest, {
        text: `⚠️ An error occurred while processing the uptime command. Please try again later.`,
      });
    }
  }
);

// Common contextInfo configuration
const getContextInfo = (title = '', userJid = '', thumbnailUrl = '') => {
  try {
    return {
      mentionedJid: [userJid],
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363249464136503@newsletter",
        newsletterName: "Beltah Tech Updates",
        serverMessageId: Math.floor(100000 + Math.random() * 900000),
      },
      externalAdReply: {
        showAdAttribution: true,
        title: title || "𝗕𝗘𝗟𝗧𝗔𝗛 𝗠𝗨𝗟𝗧𝗜 𝗗𝗘𝗩𝗜𝗖𝗘",
        body: "𝗜𝘁 𝗶𝘀 𝗻𝗼𝘁 𝘆𝗲𝘁 𝘂𝗻𝘁𝗶𝗹 𝗶𝘁 𝗶𝘀 𝗱𝗼𝗻𝗲🗿",
        thumbnailUrl: thumbnailUrl || 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg',
        sourceUrl: settings.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: false,
      },
    };
  } catch (error) {
    console.error(`Error in getContextInfo function: ${error.message}`);
    return {}; // Return an empty object to prevent breaking
  }
};

module.exports = {
  getContextInfo,
};
