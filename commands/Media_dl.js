const { keith } = require('../keizzah/keith');
const { igdl } = require("ruhend-scraper");
const axios = require('axios');
const { downloadTiktok } = require('@mrnima/tiktok-downloader');
const { facebook } = require('@mrnima/facebook-downloader');
const conf = require(__dirname + "/../set");
const { repondre } = require(__dirname + "/../keizzah/context");

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

// Instagram Download
keith({
  nomCom: "instagram",
  aliases: ["igdl", "ig", "insta"],
  categorie: "Download",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  if (!arg[0]) {
    return repondre('Please provide a valid public Instagram video link!');
  }

  if (!arg[0].includes('https://www.instagram.com/')) {
    return repondre("That is not a valid Instagram link.");
  }

  try {
    let downloadData = await igdl(arg[0]);

    if (!downloadData || !downloadData.data || downloadData.data.length === 0) {
      return repondre("No video found at the provided Instagram link.");
    }

    let videoData = downloadData.data;

    for (let i = 0; i < Math.min(20, videoData.length); i++) {
      let video = videoData[i];

      if (!video || !video.url) {
        continue;
      }

      let videoUrl = video.url;

      await zk.sendMessage(dest, {
        video: { url: videoUrl },
        mimetype: "video/mp4",
        caption: `*Instagram Video Downloaded by ${conf.BOT}*`,
        contextInfo: getContextInfo('Instagram Video', userJid, 'https://example.com/thumbnail.jpg')
      }, { quoted: ms });
    }

  } catch (error) {
    console.error(error);
    return repondre("An error occurred while processing the request. Please try again later.");
  }
});

// Facebook Download
keith({
  nomCom: "facebook",
  aliases: ["fbdl", "facebookdl", "fb"],
  categorie: "Download",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  if (!arg[0]) {
    return repondre('Please insert a public Facebook video link!');
  }

  if (!arg[0].includes('https://')) {
    return repondre("That is not a valid Facebook link.");
  }

  try {
    const videoData = await facebook(arg[0]);

    const caption = `
    *${conf.BOT} 𝐅𝐁 𝐃𝐋*
    |__________________________|
    |       *ᴅᴜʀᴀᴛɪᴏɴ*  
    ${videoData.result.duration}
    |_________________________
    | REPLY WITH BELOW NUMBERS
    |_________________________
    |____  *ғᴀᴄᴇʙᴏᴏᴋ ᴠᴅᴇᴏ ᴅʟ*  ____
    |-᳆  1 sᴅ ǫᴜᴀʟɪᴛʏ
    |-᳆  2 ʜᴅ ǫᴜᴀʟɪᴛʏ
    |_________________________
    |____  *ғᴀᴄᴇʙᴏᴏᴋ ᴀᴜᴅɪᴏ ᴅʟ*  ____
    |-᳆  3 ᴀᴜᴅɪᴏ
    |-᳆  4 ᴅᴏᴄᴜᴍᴇɴᴛ
    |-᳆  5 ᴘᴛᴛ(ᴠᴏɪᴄᴇ)
    |__________________________|
    `;

    const message = await zk.sendMessage(dest, {
      image: { url: videoData.result.thumbnail },
      caption: caption,
      contextInfo: getContextInfo('Facebook Video', userJid, 'https://example.com/thumbnail.jpg')
    }, { quoted: ms });

    const messageId = message.key.id;

    zk.ev.on("messages.upsert", async (update) => {
      const messageContent = update.messages[0];
      if (!messageContent.message) return;

      const responseText = messageContent.message.conversation || messageContent.message.extendedTextMessage?.text;
      const isReplyToMessage = messageContent.message.extendedTextMessage?.contextInfo.stanzaId === messageId;

      if (isReplyToMessage) {
        await zk.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        const videoDetails = videoData.result;

        await zk.sendMessage(dest, {
          react: { text: '⬆️', key: messageContent.key },
        });

        if (responseText === '1') {
          await zk.sendMessage(dest, {
            video: { url: videoDetails.links.SD },
            caption: conf.BOT,
          }, { quoted: messageContent });
        } else if (responseText === '2') {
          await zk.sendMessage(dest, {
            video: { url: videoDetails.links.HD },
            caption: conf.BOT,
          }, { quoted: messageContent });
        } else if (responseText === '3') {
          await zk.sendMessage(dest, {
            audio: { url: videoDetails.links.SD },
            mimetype: "audio/mpeg",
          }, { quoted: messageContent });
        } else if (responseText === '4') {
          await zk.sendMessage(dest, {
            document: {
              url: videoDetails.links.SD
            },
            mimetype: "audio/mpeg",
            fileName: "Beltah.mp3",
            caption: conf.BOT
          }, { quoted: messageContent });
        } else if (responseText === '5') {
          await zk.sendMessage(dest, {
            audio: {
              url: videoDetails.links.SD
            },
            mimetype: 'audio/mp4',
            ptt: true
          }, { quoted: messageContent });
        } else {
          await zk.sendMessage(dest, {
            text: "Invalid option. Please reply with a valid number (1-5).",
            quoted: messageContent
          });
        }
      }
    });
  } catch (error) {
    console.error(error);
    repondre('An error occurred: try fbdl2 using this link' + error.message);
  }
});

// TikTok Download
keith({
  nomCom: "tiktok",
  aliases: ["tikdl", "tiktokdl"],
  categorie: "Download",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  if (!arg[0]) {
    return repondre('Please insert a public TikTok video link!');
  }

  if (!arg[0].includes('tiktok.com')) {
    return repondre("That is not a valid TikTok link.");
  }

  try {
    let tiktokData = await downloadTiktok(arg[0]);

    const caption = `
     *${conf.BOT} 𝐓𝐈𝐊𝐓𝐎𝐊 𝐃𝐋*
    |__________________________|
    |-᳆        *ᴛɪᴛʟᴇ*  
     ${tiktokData.result.title}
    |_________________________
    ʀᴇᴘʟʏ ᴡɪᴛʜ ʙᴇʟᴏᴡ ɴᴜᴍʙᴇʀs 
    |-᳆  *1* sᴅ ǫᴜᴀʟɪᴛʏ
    |-᳆  *2*  ʜᴅ ǫᴜᴀʟɪᴛʏ
    |-᳆  *3*  ᴀᴜᴅɪᴏ
    |__________________________|
    `;

    const message = await zk.sendMessage(dest, {
      image: { url: tiktokData.result.image },
      caption: caption,
    });

    const messageId = message.key.id;

    zk.ev.on("messages.upsert", async (update) => {
      const messageContent = update.messages[0];
      if (!messageContent.message) return;

      const responseText = messageContent.message.conversation || messageContent.message.extendedTextMessage?.text;
      const keithdl = messageContent.key.remoteJid;
      const isReplyToMessage = messageContent.message.extendedTextMessage?.contextInfo.stanzaId === messageId;

      if (isReplyToMessage) {
        await zk.sendMessage(keithdl, {
          react: { text: '⬇️', key: messageContent.key },
        });

        const tiktokLinks = tiktokData.result;

        await zk.sendMessage(keithdl, {
          react: { text: '⬆️', key: messageContent.key },
        });

        if (responseText === '1') {
          await zk.sendMessage(keithdl, {
            video: { url: tiktokLinks.dl_link.download_mp4_1 },
            caption: conf.BOT,
          }, { quoted: messageContent });
        } else if (responseText === '2') {
          await zk.sendMessage(keithdl, {
            video: { url: tiktokLinks.dl_link.download_mp4_2 },
            caption: conf.BOT,
          }, { quoted: messageContent });
        } else if (responseText === '3') {
          await zk.sendMessage(keithdl, {
            audio: { url: tiktokLinks.dl_link.download_mp3 },
            mimetype: "audio/mpeg",
          }, { quoted: messageContent });
        }
      }
    });
  } catch (error) {
    console.error(error);
    repondre('An error occurred: ' + error.message);
  }
});

// Spotify Download
keith({
  nomCom: "spotify",
  aliases: ["sdl", "spotifydl"],
  reaction: '👻',
  categorie: "download"
}, async (dest, zk, params) => {
  const { repondre, arg, ms } = params;
  const text = arg.join(" ").trim();

  if (!text) {
    return repondre("What song do you want to download?");
  }

  try {
    let data = await axios.get(`https://api.dreaded.site/api/spotifydl?title=${text}`);

    if (data.data.success) {
      const audio = data.data.result.downloadLink;
      const filename = data.data.result.title;

      await zk.sendMessage(dest, {
        document: { url: audio },
        mimetype: "audio/mpeg",
        fileName: `${filename}.mp3`,
        contextInfo: getContextInfo('Spotify Song', userJid, 'https://example.com/thumbnail.jpg')
      }, { quoted: ms });

      await zk.sendMessage(dest, {
        audio: { url: audio },
        mimetype: "audio/mpeg",
        fileName: `${filename}.mp3`,
        contextInfo: getContextInfo('Spotify Song', userJid, 'https://example.com/thumbnail.jpg')
      }, { quoted: ms });

      await zk.sendMessage(dest, {
        document: { url: audio },
        mimetype: "audio/mp4",
        fileName: `${filename}.mp4`,
        contextInfo: getContextInfo('Spotify Song', userJid, 'https://example.com/thumbnail.jpg')
      }, { quoted: ms });

    } else {
      await repondre("Failed to get a valid response from API endpoint");
    }

  } catch (error) {
    console.error("Error fetching the download link:", error);
    await repondre("Unable to fetch download link, try matching exact song name or with artist name.");
  }
});
