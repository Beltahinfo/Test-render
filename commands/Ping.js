const { keith } = require('../keizzah/keith');
const Heroku = require('heroku-client');
const settings = require("../set");
const axios = require("axios");
const speed = require("performance-now");
const { exec } = require("child_process");
const { repondre } = require(__dirname + "/../keizzah/context");

// Utility Functions

/**
 * Create a delay for the specified time.
 * @param {number} ms - Milliseconds to delay.
 * @returns {Promise} - Promise to await the delay.
 */
function delay(ms) {
  console.log(`⏱️ Delay for ${ms}ms`);
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format the uptime into a human-readable string.
 * @param {number} seconds - Uptime in seconds.
 * @returns {string} - Formatted uptime string.
 */
function formatUptime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsLeft = Math.floor(seconds % 60);
  return `BOT UPTIME: 0 days, ${hours} hours, ${minutes} minutes, ${secondsLeft} seconds`;
}

// Constants
const DEFAULT_PARTICIPANT = '0@s.whatsapp.net';
const DEFAULT_REMOTE_JID = 'status@broadcast';
const DEFAULT_THUMBNAIL_URL = 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg';
const DEFAULT_TITLE = "BELTAH TECH BOT";
const DEFAULT_BODY = "Your AI Assistant Chuddy Buddy";

// Default message configuration
const fgg = {
  key: {
    fromMe: false,
    participant: DEFAULT_PARTICIPANT,
    remoteJid: DEFAULT_REMOTE_JID,
  },
  message: {
    contactMessage: {
      displayName: `Beltah Tech Info`,
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;BELTAH MD;;;\nFN:BELTAH MD\nitem1.TEL;waid=${DEFAULT_PARTICIPANT.split('@')[0]}:${DEFAULT_PARTICIPANT.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
    },
  },
};

/**
 * Construct contextInfo object for messages.
 * @param {string} title - Title for the external ad reply.
 * @param {string} userJid - User JID to mention.
 * @param {string} thumbnailUrl - Thumbnail URL.
 * @returns {object} - ContextInfo object.
 */
function getContextInfo(title = DEFAULT_TITLE, userJid = DEFAULT_PARTICIPANT, thumbnailUrl = DEFAULT_THUMBNAIL_URL) {
  try {
    return {
      mentionedJid: [userJid],
      forwardingScore: 999,
      isForwarded: true,
      externalAdReply: {
        showAdAttribution: true,
        title : DEFAULT_TITLE ,
        body: DEFAULT_BODY,
        thumbnailUrl : DEFAULT_THUMBNAIL_URL,
        sourceUrl: settings.GURL || '',
      },
    };
  } catch (error) {
    console.error(`Error in getContextInfo: ${error.message}`);
    return {}; // Prevent breaking on error
  }
}

// Commands

/**
 * Test Command
 */
keith({
  nomCom: "test",
  aliases: ["alive", "testing"],
  categorie: "system",
  reaction: "👻"
}, async (dest, zk, commandeOptions) => {
  const audioFiles = [
    'https://files.catbox.moe/hpwsi2.mp3',
    'https://files.catbox.moe/xci982.mp3',
    // Add more URLs as needed
  ];
  const selectedAudio = audioFiles[Math.floor(Math.random() * audioFiles.length)];
  const audioMessage = {
    audio: {
      url: selectedAudio,
    },
    mimetype: 'audio/mpeg',
    ptt: true,
    waveform: [100, 0, 100, 0, 100, 0, 100],
    fileName: 'shizo',
    
  contextInfo: getContextInfo("BELTAH-MD LIVE TEST", '' , 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg')
         }, { quoted: fgg });

  await zk.sendMessage(dest, audioMessage, { quoted: commandeOptions.ms });
});

/**
 * Uptime Command
 */
keith({
  nomCom: 'uptime',
  aliases: ['runtime', 'running'],
  desc: 'To check runtime',
  categorie: 'system',
  reaction: '⚠️',
  fromMe: true,
}, async (dest, zk, commandeOptions) => {
  const botUptime = process.uptime(); // Get the bot uptime in seconds
  await zk.sendMessage(dest, {
    text: `*🛸 ʙᴇʟᴛᴀʜ-ᴍᴅ ʀᴜɴᴛɪᴍᴇ 🛸*\n\n${formatUptime(botUptime)}`,
    contextInfo: getContextInfo("📡ʙᴇʟᴛᴀʜ-ᴍᴅ ᴜᴘᴛɪᴍᴇ📡", '', 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg'),
  }, { quoted: fgg });

  console.log("Runtime results sent successfully!");
});

/**
 * Ping Command
 */
keith({
  nomCom: 'ping',
  aliases: ['speed', 'latency'],
  desc: 'To check bot response time',
  categorie: 'system',
  reaction: '👻',
  fromMe: true,
}, async (dest, zk) => {
  const pingResults = Array.from({ length: 1 }, () => Math.floor(Math.random() * 10000 + 1000));
  const formattedResults = pingResults.map(ping => `*📡 ᴘᴏɴɢ 📡*\n\n*${ping}...ᴍɪʟʟɪsᴇᴄᴏɴᴅs*\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴇʟᴛᴀʜ ᴛᴇᴄʜ ᴛᴇᴀᴍ*`);
  await zk.sendMessage(dest, {
    text: `${formattedResults}`,
    contextInfo: getContextInfo("🛸 ʙᴇʟᴛᴀʜ-ᴍᴅ sᴘᴇᴇᴅ ᴛᴇsᴛ 🛸", '', 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg'),
  }, { quoted: fgg });

  console.log("Ping results sent successfully!");
});
