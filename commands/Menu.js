const axios = require("axios");
const { keith } = require(__dirname + "/../keizzah/keith");
const { format } = require(__dirname + "/../keizzah/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const settings = require(__dirname + "/../set");

const readMore = String.fromCharCode(8206).repeat(4001);

// Utility functions
const toFancyUppercaseFont = (text) => {
    const fonts = {
        'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌',
        'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙'
    };
    return text.split('').map(char => fonts[char] || char).join('');
};

const toFancyLowercaseFont = (text) => {
    const fonts = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ',
        'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': '𝚜', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.split('').map(char => fonts[char] || char).join('');
};

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

const fetchGitHubStats = async () => {
    try {
        const response = await axios.get("https://api.github.com/repos/Beltah254/X-BOT");
        const forksCount = response.data.forks_count;
        const starsCount = response.data.stargazers_count;
        const totalUsers = forksCount * 2 + starsCount * 2;
        return { forks: forksCount, stars: starsCount, totalUsers };
    } catch (error) {
        console.error("Error fetching GitHub stats:", error);
        return { forks: 0, stars: 0, totalUsers: 0 };
    }
};

// Definitions for context and messaging
const NEWS_LETTER_JID = "120363249464136503@newsletter"; // Replace with your real one
const BOT_NAME = "👻 Beltah Tech Updates 👻";
const DEFAULT_THUMBNAIL = "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg";

const getContextInfo = (title = '', userJid = '', thumbnailUrl = '') => ({
    contextInfo: {
        mentionedJid: [userJid],
        forwardingScore: 999,
        isForwarded: true,
        businessMessageForwardInfo: {
            businessOwnerJid: NEWS_LETTER_JID,
        },
        forwardedNewsletterMessageInfo: {
            newsletterJid: NEWS_LETTER_JID,
            newsletterName: BOT_NAME,
            serverMessageId: Math.floor(100000 + Math.random() * 900000)
        },
        externalAdReply: {
            title: title || BOT_NAME,
            body: "Premium WhatsApp Bot Solution",
            thumbnailUrl: thumbnailUrl || DEFAULT_THUMBNAIL,
            mediaType: 1,
            mediaUrl: "https://wa.me/254114141192", // link to bot or business
            showAdAttribution: true,
            renderLargerThumbnail: false
        }
    }
});

// Random quotes
const quotes = [
    "Dream big, work hard.", "Stay humble, hustle hard.", "Believe in yourself.",
    "Success is earned, not given.", "Actions speak louder than words.",
    "The best is yet to come.", "Keep pushing forward.", "Do more than just exist.",
    "Progress, not perfection.", "Stay positive, work hard.", "Be the change you seek."
];

const getRandomQuote = () => quotes[Math.floor(Math.random() * quotes.length)];

// Main menu command
keith(
    {
        nomCom: "menu",
        aliases: ["liste", "helplist", "commandlist"],
        categorie: "SYSTEM",
    },
    async (message, client, config) => {
        const { ms, respond, prefix, nomAuteurMessage } = config;
        const commands = require(__dirname + "/../keizzah/keith").cm;
        const categorizedCommands = {};
        const mode = settings.MODE.toLowerCase() !== "public" ? "Private" : "Public";

        // Organize commands into categories
        commands.forEach(command => {
            const category = command.categorie.toUpperCase();
            if (!categorizedCommands[category]) {
                categorizedCommands[category] = [];
            }
            categorizedCommands[category].push(command.nomCom);
        });

        moment.tz.setDefault("Africa/Nairobi");
        const currentTime = moment();
        const formattedTime = currentTime.format("HH:mm:ss");
        const formattedDate = currentTime.format("DD/MM/YYYY");
        const currentHour = currentTime.hour();

        const greetings = ["Time to own the system 🌄", "Stay vigilant, stay sharp 🌃", "Keep your exploits ready ⛅", "The darknet never sleeps 🌙"];
        const greeting = currentHour < 12 ? greetings[0] : currentHour < 17 ? greetings[1] : currentHour < 21 ? greetings[2] : greetings[3];

        const { totalUsers } = await fetchGitHubStats();
        const formattedTotalUsers = totalUsers.toLocaleString();
        const randomQuote = getRandomQuote();

        let responseMessage = `
 ${greeting}, *${nomAuteurMessage || "User"}*
  
 ╭━━━━❮  ${settings.BOT}  ❯━━━━╮ 
 ┃✰╭────────────
 ┃✰│ *ʙᴏᴛ ᴏᴡɴᴇʀ:* ${settings.OWNER_NAME}
 ┃✰│ *ᴘʀᴇғɪx:* *[ ${settings.PREFIXE} ]*
 ┃✰│ *ᴛɪᴍᴇ:* ${formattedTime}
 ┃✰│ *ᴄᴏᴍᴍᴀɴᴅꜱ:* ${commands.length} 
 ┃✰│ *ᴅᴀᴛᴇ:* ${formattedDate}
 ┃✰│ *ᴍᴏᴅᴇ:* ${mode}
 ┃✰│ *ʀᴀᴍ:* ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
 ┃✰│ *ᴜᴘᴛɪᴍᴇ:* ${formatUptime(process.uptime())}
 ┃✰╰────────────
 ╰══════════════════⩥
 > *${randomQuote}*
`;

        let commandsList = "";
        const sortedCategories = Object.keys(categorizedCommands).sort();

        for (const category of sortedCategories) {
            commandsList += `\n*╭━━❮ ${toFancyUppercaseFont(category)} ❯━━╮*\n┃✰╭────────────`;
            const sortedCommands = categorizedCommands[category].sort();
            for (const command of sortedCommands) {
                commandsList += `\n┃✰ ${toFancyLowercaseFont(command)}`;
            }
            commandsList += "\n┃✰╰────────────\n╰══════════════════⩥";
        }

        commandsList += readMore + "\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙᴇʟᴛᴀʜ ʜᴀᴄᴋɪɴɢ ᴛᴇᴀᴍ\n";

        try {
            const senderName = message.sender || message.from;
            await client.sendMessage(message, {
                 text: responseMessage + commandsList,
                 contextInfo: getContextInfo("BELTAH-MD SYSTEM-OVERVIEW", senderName, DEFAULT_THUMBNAIL)
             }, { quoted: ms });
        } catch (error) {
            console.error("Menu error: ", error);
            respond("🥵🥵 Menu error: " + error);
        }
    }
);
