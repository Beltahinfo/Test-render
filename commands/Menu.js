const axios = require("axios");
const { keith } = require(__dirname + "/../keizzah/keith");
const { format } = require(__dirname + "/../keizzah/mesfonctions");
const os = require('os');
const moment = require("moment-timezone");
const settings = require(__dirname + "/../set");

const readMore = String.fromCharCode(8206).repeat(4001);

// Fancy font conversion functions
const toFancyFont = (text, isUppercase) => {
    const fonts = isUppercase
        ? {
            'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌',
            'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙'
        }
        : {
            'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ',
            'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': '𝚜', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
        };
    return text.split('').map(char => fonts[char] || char).join('');
};

// Format uptime
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

// Fetch GitHub stats
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

// Common contextInfo configuration
const getContextInfo = (title = '', userJid = '', thumbnailUrl = '') => ({
    mentionedJid: [userJid],
    forwardingScore: 999,
    isForwarded: true,
    externalAdReply: {
        showAdAttribution: true,
        title: title || "BELTAH-MD BOT",
        body: "𝗜𝘁 𝗶𝘀 𝗻𝗼𝘁 𝘆𝗲𝘁 𝘂𝗻𝘁𝗶𝗹 𝗶𝘁 𝗶𝘀 𝗱𝗼𝗻𝗲🗿",
        thumbnailUrl: thumbnailUrl || 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg',
        sourceUrl: settings.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: false
    }
});

// Get random quote
const quotes = [
    "Dream big, work hard.", "Stay humble, hustle hard.", "Believe in yourself.",
    "Success is earned, not given.", "Actions speak louder than words.",
    "The best is yet to come.", "Keep pushing forward.", "Do more than just exist.",
    "Progress, not perfection.", "Stay positive, work hard.", "Be the change you seek.",
    "Never stop learning.", "Chase your dreams.", "Be your own hero.",
    "Life is what you make of it.", "Do it with passion or not at all.",
    "You are stronger than you think.", "Create your own path.", "Make today count.",
    "Embrace the journey.", "The best way out is always through.", "Strive for progress.",
    "Don't wish for it, work for it.", "Live, laugh, love.", "Keep going, you're getting there."
];

const getRandomQuote = () => quotes[Math.floor(Math.random() * quotes.length)];

// Generate the menu in hacker-style language
const generateMenu = async (message, client, config, commandName) => {
    const { ms, respond, prefix, nomAuteurMessage } = config;
    const commands = require(__dirname + "/../keizzah/keith").cm;
    const categorizedCommands = {};
    const mode = settings.MODE.toLowerCase() !== "public" ? "Private" : "Public";

    // Organize commands into categories
    commands.forEach(command => {
        const category = command.categorie.toUpperCase();
        if (!categorizedCommands[category]) categorizedCommands[category] = [];
        categorizedCommands[category].push(command.nomCom);
    });

    // Date and time
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

    // Response message in hacker-style language
    let responseMessage = `
 ${greeting}, *${nomAuteurMessage || "Operative"}*
 
╭━━━ 〔 ${settings.BOT} - SYSTEM OVERVIEW 〕━━━
┃▪ *CommandControl*: ${settings.OWNER_NAME}
┃▪ *PrefixCode*: ${settings.PREFIXE}
┃▪ *NodeTime*: ${formattedTime}
┃▪ *Payloads Loaded*: ${commands.length}
┃▪ *Date*: ${formattedDate}
┃▪ *OpMode*: ${mode}
┃▪ *Connected Nodes*: ${formattedTotalUsers}
┃▪ *RAM Usage*: ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
┃▪ *Uptime*: ${formatUptime(process.uptime())}
╰━━━━━━━━━━━━━━━━━━━━━━━
> *${randomQuote}*
`;

    // Commands list
    let commandsList = "";
    const sortedCategories = Object.keys(categorizedCommands).sort();
    sortedCategories.forEach(category => {
        commandsList += `\n*${toFancyFont(category, true)}*\n`;
        const sortedCommands = categorizedCommands[category].sort();
        sortedCommands.forEach(command => {
            commandsList += `▪ ${toFancyFont(command, false)}\n`;
        });
    });
    commandsList += readMore + "\nPowered by Beltah Hacking Team";

    try {
        const senderName = message.sender || message.from;
        await client.sendMessage(message, {
            text: responseMessage + commandsList,
            contextInfo: getContextInfo("BELTAH-MD MENU", senderName)
        }, { quoted: ms });
    } catch (error) {
        console.error(`${commandName} error: `, error);
        respond("Error: " + error.message);
    }
};
/*// Generate the menu
const generateMenu = async (message, client, config, commandName) => {
    const { ms, respond, prefix, nomAuteurMessage } = config;
    const commands = require(__dirname + "/../keizzah/keith").cm;
    const categorizedCommands = {};
    const mode = settings.MODE.toLowerCase() !== "public" ? "Private" : "Public";

    // Organize commands into categories
    commands.forEach(command => {
        const category = command.categorie.toUpperCase();
        if (!categorizedCommands[category]) categorizedCommands[category] = [];
        categorizedCommands[category].push(command.nomCom);
    });

    // Date and time
    moment.tz.setDefault("Africa/Nairobi");
    const currentTime = moment();
    const formattedTime = currentTime.format("HH:mm:ss");
    const formattedDate = currentTime.format("DD/MM/YYYY");
    const currentHour = currentTime.hour();
    const greetings = ["Good Morning 🌄", "Good Afternoon 🌃", "Good Evening ⛅", "Good Night 🌙"];
    const greeting = currentHour < 12 ? greetings[0] : currentHour < 17 ? greetings[1] : currentHour < 21 ? greetings[2] : greetings[3];

    const { totalUsers } = await fetchGitHubStats();
    const formattedTotalUsers = totalUsers.toLocaleString();
    const randomQuote = getRandomQuote();

    // Response message
    let responseMessage = `
 ${greeting}, *${nomAuteurMessage || "User"}*
 
╭━━━ 〔 ${settings.BOT} 〕━━━
┃▪ Owner: ${settings.OWNER_NAME}
┃▪ Prefix: ${settings.PREFIXE}
┃▪ Time: ${formattedTime}
┃▪ Commands: ${commands.length}
┃▪ Date: ${formattedDate}
┃▪ Mode: ${mode}
┃▪ Users: ${formattedTotalUsers}
┃▪ RAM: ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
┃▪ Uptime: ${formatUptime(process.uptime())}
╰━━━━━━━━━━━━━━━
> *${randomQuote}*
`;

    // Commands list
    let commandsList = "";
    const sortedCategories = Object.keys(categorizedCommands).sort();
    sortedCategories.forEach(category => {
        commandsList += `\n*${toFancyFont(category, true)}*\n`;
        const sortedCommands = categorizedCommands[category].sort();
        sortedCommands.forEach(command => {
            commandsList += `▪ ${toFancyFont(command, false)}\n`;
        });
    });
    commandsList += readMore + "\nPowered by Beltah Hacking Team";

    try {
        const senderName = message.sender || message.from;
        await client.sendMessage(message, {
            text: responseMessage + commandsList,
            contextInfo: getContextInfo("BELTAH-MD MENU", senderName)
        }, { quoted: ms });
    } catch (error) {
        console.error(`${commandName} error: `, error);
        respond("Error: " + error.message);
    }
};

// Register commands
["menu", "list", "help", "allcmd"].forEach(cmd =>
    keith({ nomCom: cmd, aliases: ["liste", "commandlist"], categorie: "SYSTEM" }, async (message, client, config) => {
        await generateMenu(message, client, config, cmd);
    })
);*/
