const { keith } = require("../keizzah/keith");
const axios = require('axios');
const conf = require(__dirname + "/../set");
const { repondre } = require(__dirname + "/../keizzah/context");

// Common contextInfo configuration
const getContextInfo = (title = '', userJid = '', thumbnailUrl = '') => ({
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
    renderLargerThumbnail: false
  }
});

// General downloader function
const handleDownload = async (dest, zk, params, serviceName, apiUrl, exampleUsage) => {
  const { repondre, arg } = params;
  const query = arg.join(" ").trim();

  if (!query) {
    return repondre(exampleUsage);
  }

  try {
    const response = await axios.get(`${apiUrl}${encodeURIComponent(query)}`, {
      timeout: 15000 // 15s timeout
    });

    if (response.status === 200 && response.data) {
      const result = response.data.link || response.data.url || "Download link not found.";

      await zk.sendMessage(dest, {
        text: `📥 *${serviceName} Download:*\n\n🔗 *Link:* ${result}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴇʟᴛᴀʜ ᴛᴇ𝗖𝗛 ᴛ𝗘𝗔𝗠`,
        contextInfo: getContextInfo("Fast & Reliable Downloads", dest, conf.URL),
      });
    } else {
      throw new Error("Invalid response from the API");
    }
  } catch (error) {
    console.error(`Error fetching ${serviceName} download:`, error.message);
    await repondre(`❌ Failed to fetch ${serviceName} download. Try again later.`);
  }
};
