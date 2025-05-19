const { keith } = require("../keizzah/keith");
const axios = require('axios');
const ytSearch = require('yt-search');
const conf = require(__dirname + '/../set');
const { Catbox } = require("node-catbox");
const fs = require('fs-extra');
const { repondre } = require(__dirname + "/../keizzah/context");

// ... previous code ...

// Audio download command
keith({
  nomCom: "lay",
  aliases: ["song", "playdoc", "audio", "mp3"],
  categorie: "download",
  reaction: "🎵"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, userJid } = commandOptions;

  try {
    if (!arg[0]) {
      return repondre(zk, dest, ms, "Please provide a song name.");
    }

    const query = arg.join(" ");
    const video = await searchYouTube(query);

    // Prepare the extra video details
    const videoDetails = `*🎵 Title:* ${video.title}
*📁 File Name:* ${video.title}.mp3
*👁️ Views:* ${video.views?.toLocaleString() ?? "N/A"}
*📅 Uploaded:* ${video.ago ?? "N/A"}
*⏱️ Duration:* ${video.timestamp ?? "N/A"}
*🔗 URL:* ${video.url}`;

    await zk.sendMessage(dest, {
      text: `BELTAH-MD Song Downloader\n\n${videoDetails}`,
      contextInfo: getContextInfo("Downloading Requested Audio", userJid, video.thumbnail)
    }, { quoted: fgg });

    const apis = [
      `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(video.url)}`,
      `https://www.dark-yasiya-api.site/download/ytmp3?url=${encodeURIComponent(video.url)}`,
      `https://api.giftedtech.web.id/api/download/dlmp3?url=${encodeURIComponent(video.url)}&apikey=gifted-md`,
      `https://api.dreaded.site/api/ytdl/audio?url=${encodeURIComponent(video.url)}`
    ];

    const downloadData = await downloadFromApis(apis);
    const { download_url, title } = downloadData.result;

    const messagePayloads = [
      {
        audio: { url: download_url },
        mimetype: 'audio/mp4',
        caption: `🎵 *${title}*`,
        contextInfo: getContextInfo(title, userJid, video.thumbnail)
      },
      {
        document: { url: download_url },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`.replace(/[^\w\s.-]/gi, ''),
        caption: `📁 *${title}* (Document)`,
        contextInfo: getContextInfo(title, userJid, video.thumbnail)
      }
    ];

    for (const payload of messagePayloads) {
      await zk.sendMessage(dest, payload, { quoted: ms });
    }

  } catch (error) {
    console.error('Audio download error:', error);
    repondre(zk, dest, ms, `Download failed: ${error.message}`);
  }
});

// ... rest of code ...
