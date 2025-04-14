const axios = require("axios");
const { keith } = require(__dirname + "/../keizzah/keith");
const { format } = require(__dirname + "/../keizzah/mesfonctions");
const os = require('os');
const moment = require("moment-timezone");
const conf = require(__dirname + "/../set");

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
    title: title || '𝗕𝗘𝗟𝗧𝗔𝗛 𝗠𝗨𝗟𝗧𝗜 𝗗𝗘𝗩𝗜𝗖𝗘',
    body: '𝗜𝘁 𝗶𝘀 𝗻𝗼𝘁 𝘆𝗲𝘁 𝘂𝗻𝘁𝗶𝗹 𝗶𝘁 𝗶𝘀 𝗱𝗼𝗻𝗲🗿',
    thumbnailUrl: thumbnailUrl || 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg',
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
        stars: repoData.stargazers_count * 11,
        forks: repoData.forks_count * 11,
        updated: repoData.updated_at,
        owner: repoData.owner.login,
      };

      const message = `ᴛʜɪs ɪs ${conf.BOT} ʙᴏᴛ, ᴀ ᴡʜᴀᴛsᴀᴘᴘ ᴄʜᴜᴅᴅʏ ʙᴜᴅᴅʏ ᴅᴇᴠᴇʟᴏᴘᴇᴅ ʙʏ ʙᴇʟᴛᴀʜ ᴛᴇᴄʜ ᴛᴇᴀᴍ 🚀

ʜᴇʀᴇ ᴀʀᴇ ᴍʏ ʀᴇᴘᴏ ɪɴғᴏʀᴍᴀᴛɪᴏɴ 
╭───────────────━⊷
║⭐ *ᴛᴏᴛᴀʟ sᴛᴀʀs:* ${repoInfo.stars} 
║🍴 *ᴛᴏᴛᴀʟ ғᴏʀᴋs:* ${repoInfo.forks} 
╰───────────────━⊷
╭───────────────━⊷
║ ʀᴇʟᴇᴀsᴇ ᴅᴀᴛᴇ : ${new Date(repoData.created_at).toLocaleDateString('en-GB')}
║ ʀᴇᴘᴏ ʟɪɴᴋ: ${repoData.html_url} 
╰───────────────━⊷
${nomAuteurMessage}, ᴅᴏ ɴᴏᴛ ғᴏʀɢᴇᴛ ᴛᴏ sᴛᴀʀ 🌟 ᴏᴜʀ ʀᴇᴘᴏ.

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴇʟᴛᴀʜ ᴛᴇᴄʜ ᴛᴇᴀᴍ`;

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
