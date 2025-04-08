const axios = require("axios");
const { keith } = require("../keizzah/keith");
const { format } = require("../keizzah/mesfonctions");
const os = require('os');
const moment = require("moment-timezone");
const conf = require("../set");

const readMore = String.fromCharCode(8206).repeat(4001);

const formatUptime = (seconds) => {
    seconds = Number(seconds);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return [
        days > 0 ? `${days} ${days === 1 ? "day" : "days"}` : '',
        hours > 0 ? `${hours} ${hours === 1 ? "hour" : "hours"}` : '',
        minutes > 0 ? `${minutes} ${minutes === 1 ? "minute" : "minutes"}` : '',
        remainingSeconds > 0 ? `${remainingSeconds} ${remainingSeconds === 1 ? "second" : "seconds"}` : ''
    ].filter(Boolean).join(', ');
};

// Fetch GitHub stats and multiply by 10
const fetchGitHubStats = async () => {
    try {
        const response = await axios.get("https://api.github.com/repos/Beltah254/X-BOT");
        const forksCount = response.data.forks_count * 10; // Multiply forks by 10
        const starsCount = response.data.stargazers_count * 10; // Multiply stars by 10
        const totalUsers = forksCount + starsCount; // Assuming totalUsers is just the sum
        return { forks: forksCount, stars: starsCount, totalUsers };
    } catch (error) {
        console.error("Error fetching GitHub stats:", error);
        return { forks: 0, stars: 0, totalUsers: 0 };
    }
};

const sendRepoInfo = async (command, reply, context) => {
    const { repondre, auteurMessage, nomAuteurMessage } = context;
    try {
        const response = await axios.get("https://api.github.com/repos/Beltah254/X-BOT");
        const repoData = response.data;

        if (repoData) {
            const repoInfo = {
                stars: repoData.stargazers_count * 10,
                forks: repoData.forks_count * 10,
                updated: repoData.updated_at,
                owner: repoData.owner.login
            };

            const releaseDate = new Date(repoData.created_at).toLocaleDateString('en-GB');
            const message = `
*Hello 👋 ${nomAuteurMessage}*
╭───────────────━⊷
║💡 *ʙᴏᴛ ɴᴀᴍᴇ:* ${conf.BOT}
║⭐ *ᴛᴏᴛᴀʟ sᴛᴀʀs:* ${repoInfo.stars}
║🍴 *ᴛᴏᴛᴀʟ ғᴏʀᴋs:* ${repoInfo.forks}
║👤 *ᴏᴡɴᴇʀ:* *${conf.OWNER_NAME}*
╰───────────────━⊷
╭───────────────━⊷
║ ʀᴇʟᴇᴀsᴇ ᴅᴀᴛᴇ : ${releaseDate}
║ ʀᴇᴘᴏ ʟɪɴᴋ:  github.com/Beltah254/X-BOT
╰───────────────━⊷
> © ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴇʟᴛᴀʜ ᴛᴇᴄʜ ᴛᴇᴀᴍ`;

            await reply.sendMessage(command, {
                text: message,
                contextInfo: getContextInfo("𝐁𝐄𝐋𝐓𝐀𝐇 𝐌𝐃", auteurMessage, "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg"),
                contactMessage: {
                    displayName: nomAuteurMessage,
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:${nomAuteurMessage}\nitem1.TEL;waid=${auteurMessage.split('@')[0]}:${auteurMessage.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
                },
            });
        } else {
            console.log("Could not fetch data");
            repondre("An error occurred while fetching the repository data.");
        }
    } catch (error) {
        console.error("Error fetching repository data:", error);
        repondre("An error occurred while fetching the repository data.");
    }
};

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
        title: title || "𝗕𝗘𝗟𝗧𝗔𝗛-𝗠𝗗",
        body: "𝗜𝘁 𝗶𝘀 𝗻𝗼𝘁 𝘆𝗲𝘁 𝘂𝗻𝘁𝗶𝗹 𝗶𝘁 𝗶𝘀 𝗱𝗼𝗻𝗲🗿",
        thumbnailUrl: thumbnailUrl || 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg',
        sourceUrl: settings.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: false
    }
});

const commands = [
    { nomCom: "repo", aliases: ["repo"], reaction: '👻', nomFichier: __filename },
    { nomCom: "sc", aliases: ["script", "sc"], reaction: '👻', nomFichier: __filename },
    { nomCom: "script", aliases: ["script", "sc"], reaction: '👻', nomFichier: __filename }
];

commands.forEach(command => {
    keith(command, sendRepoInfo);
});
