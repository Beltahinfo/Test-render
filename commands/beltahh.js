const axios = require("axios");
const { keith } = require(__dirname + "/../keizzah/keith");
const { format } = require(__dirname + "/../keizzah/mesfonctions");
const os = require('os');
const moment = require("moment-timezone");
const conf = require(__dirname + "/../set");
// Constants
const DEFAULT_PARTICIPANT = '0@s.whatsapp.net';
const DEFAULT_REMOTE_JID = 'status@broadcast';
const DEFAULT_THUMBNAIL_URL = 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg';
const DEFAULT_TITLE = "𝗕𝗘𝗟𝗧𝗔𝗛 𝗠𝗨𝗟𝗧𝗜 𝗗𝗘𝗩𝗜𝗖𝗘";
const DEFAULT_BODY = "𝗜𝘁 𝗶𝘀 𝗻𝗼𝘁 𝘆𝗲𝘁 𝘂𝗻𝘁𝗶𝗹 𝗶𝘁 𝗶𝘀 𝗱𝗼𝗻𝗲🗿";

// Utility Functions
/**
 * Format runtime into a clean string.
 * @param {number} seconds - The runtime in seconds.
 * @returns {string} - Formatted runtime string.
 */
function formatRuntime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsLeft = Math.floor(seconds % 60);
  return `${hours}h ${minutes}m ${secondsLeft}s`;
}

/**
 * Construct contextInfo object for messages.
 * @param {string} title - Title for the external ad reply.
 * @param {string} userJid - User JID to mention.
 * @param {string} thumbnailUrl - Thumbnail URL.
 * @returns {object} - ContextInfo object.
 */
const getContextInfo = (title = '', userJid = '', thumbnailUrl = '') => ({
  mentionedJid: [userJid],
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363249464136503@newsletter',
    newsletterName: 'Beltah Tech Updates',
    serverMessageId: Math.floor(100000 + Math.random() * 900000),
  },
  externalAdReply: {
    showAdAttribution: true,
    title: title || DEFAULT_TITLE,
    body: DEFAULT_BODY,
    thumbnailUrl: thumbnailUrl || DEFAULT_THUMBNAIL_URL,
    sourceUrl: conf.GURL || '',
    mediaType: 1,
    renderLargerThumbnail: false,
  },
});

// Example usage within the existing context
keith({
  nomCom: 'repo',
  aliases: ['script', 'sc'],
  reaction: '🛸',
  nomFichier: __filename,
}, async (command, reply, context) => {
  const { repondre, auteurMessage, nomAuteurMessage } = context;

  try {
    const response = await axios.get('https://api.github.com/repos/Beltah254/X-BOT');
    const repoData = response.data;

    if (repoData) {
      const repoInfo = {
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        owner: repoData.owner.login,
        updated: new Date(repoData.updated_at).toLocaleDateString('en-GB'),
        created_at: new Date(repoData.created_at).toLocaleDateString('en-GB'),
      };

      const uptimeSeconds = Math.floor(process.uptime());
      const formattedUptime = formatRuntime(uptimeSeconds);

      const message = `🤖 *${conf.BOT} WhatsApp Bot Information*

📌 *Uptime*: ${formattedUptime}
⭐ *Total Stars*: ${repoInfo.stars}
🍴 *Total Forks*: ${repoInfo.forks}
👤 *Repository Owner*: ${repoInfo.owner}

📅 *Repository Created*: ${repoInfo.created_at}
📅 *Last Updated*: ${repoInfo.updated}

🔗 *Repository Link*: ${repoData.html_url}

Thank you, ${nomAuteurMessage}, for your interest in our project. Don't forget to ⭐ star our repository for updates and improvements! 

> Powered by *Beltah Tech Team* 🚀`;

      const contextInfo = getContextInfo(conf.BOT, auteurMessage, conf.URL);

      await reply.sendMessage(command, {
        text: message,
        contextInfo,
      });
    } else {
      repondre('An error occurred while fetching the repository data.');
    }
  } catch (error) {
    console.error('Error fetching repository data:', error);
    repondre('An error occurred while fetching the repository data.');
  }
});
