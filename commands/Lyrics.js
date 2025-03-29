
const { keith } = require("../keizzah/keith");
const axios = require("axios");
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
    thumbnailUrl: thumbnailUrl || '',
    sourceUrl: settings.GURL || '',
    mediaType: 1,
    renderLargerThumbnail: false
  }
});

// Define the command with aliases
keith({
  nomCom: "lyrics",
  aliases: ["mistari", "lyric"],
  reaction: '🛸',
  categorie: "search"
}, async (dest, zk, params) => {
  const { repondre: sendResponse, arg: commandArgs, ms } = params;
  const text = commandArgs.join(" ").trim();

  if (!text) {
    return sendResponse("Please provide a song name.");
  }

  // Function to get lyrics data from APIs
  const getLyricsData = async (url) => {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching data from API:', error);
      return null;
    }
  };

  // List of APIs to try
  const apis = [
    `https://api.dreaded.site/api/lyrics?title=${encodeURIComponent(text)}`,
    `https://some-random-api.com/others/lyrics?title=${encodeURIComponent(text)}`,
    `https://api.davidcyriltech.my.id/lyrics?title=${encodeURIComponent(text)}`
  ];

  let lyricsData;
  for (const api of apis) {
    lyricsData = await getLyricsData(api);
    if (lyricsData && lyricsData.result && lyricsData.result.lyrics) break;
  }

  // Check if lyrics data was found
  if (!lyricsData || !lyricsData.result || !lyricsData.result.lyrics) {
    return sendResponse(`Failed to retrieve lyrics. Please try again.`);
  }

  const { title, artist, thumb, lyrics } = lyricsData.result;
  const imageUrl = thumb || "https://i.imgur.com/Cgte666.jpeg";

  const caption = `𝐁𝐄𝐋𝐓𝐀𝐇 𝐌𝐃\n\n**Title**: ${title}\n**Artist**: ${artist}\n\n${lyrics}`;

  try {
    // Fetch the image
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(imageResponse.data, 'binary');

    // Send the message with the image and lyrics
    await zk.sendMessage(
      dest,
      {
        image: imageBuffer,
        caption: caption
      },
      { quoted: ms }
    );
await zk.sendMessage(dest, {
        caption: caption, 
            contextInfo: getContextInfo("𝗕𝗘𝗟𝗧𝗔𝗛 𝗠𝗨𝗟𝗧𝗜 𝗗𝗘𝗩𝗜𝗖𝗘", senderName, imageBuffer )
        }, { quoted: ms });

  } catch (error) {
    console.error('Error fetching or sending image:', error);
    // Fallback to sending just the text if image fetch fails
    await sendResponse(caption);
  }
});
 
