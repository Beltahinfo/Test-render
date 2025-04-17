const axios = require("axios");
const { keith } = require(__dirname + "/../keizzah/keith");
const { format } = require(__dirname + "/../keizzah/mesfonctions");
const os = require('os');
const moment = require("moment-timezone");
const settings = require(__dirname + "/../set");

const readMore = String.fromCharCode(8206).repeat(4001);

// Add fgg object
let fgg = {
  key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: 'status@broadcast' },
  message: {
    contactMessage: {
      displayName: `👻Beltah Tech 👻`,
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:'BELTAH MD'\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
    },
  },
};

// Function to format uptime
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

// Function to fetch GitHub stats
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

// Context info configuration
const getContextInfo = (title = '', userJid = '', thumbnailUrl = '') => ({
    mentionedJid: [userJid],
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: "120363249464136503@newsletter",
        newsletterName: "👻 Beltah Tech Updates 👻",
        serverMessageId: Math.floor(100000 + Math.random() * 900000),
    },
    externalAdReply: {
        showAdAttribution: true,
        title: title || "BELTAH-MD BOT",
        body: "Your trusted companion for automation and efficiency.",
        thumbnailUrl: thumbnailUrl || 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg',
        sourceUrl: settings.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: false
    }
});

// Menu logic
keith({ nomCom: "menuu", aliases: ["help", "commands"], categorie: "SYSTEM" }, async (message, client, config) => {
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

    const greetings = ["Good Morning", "Good Afternoon", "Good Evening", "Good Night"];
    const greeting = currentHour < 12 ? greetings[0] : currentHour < 17 ? greetings[1] : currentHour < 21 ? greetings[2] : greetings[3];

    const { totalUsers } = await fetchGitHubStats();
    const formattedTotalUsers = totalUsers.toLocaleString();

    let responseMessage = `
${greeting}, *${nomAuteurMessage || "User"}*

Welcome to *${settings.BOT}*, your all-in-one automation solution. Below is the list of available commands categorized for your convenience.

📅 *Date:* ${formattedDate}
⏰ *Time:* ${formattedTime}
🛠️ *Mode:* ${mode}
💾 *RAM Usage:* ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
📈 *Uptime:* ${formatUptime(process.uptime())}
🌍 *Total Users:* ${formattedTotalUsers}

*MAIN MENU*
─────────────────`;

    let commandsList = "";
    const sortedCategories = Object.keys(categorizedCommands).sort();

    for (const category of sortedCategories) {
        commandsList += `\n*${category}*\n`;
        const sortedCommands = categorizedCommands[category].sort();
        for (const command of sortedCommands) {
            commandsList += `- ${command}\n`;
        }
    }

    commandsList += "\n─────────────────\nPowered by *Beltah Tech*.";

    try {
        const senderName = message.sender || message.from;
        await client.sendMessage(message, {
            text: responseMessage + commandsList,
            contextInfo: getContextInfo("BELTAH-MD MENU", senderName, 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg')
        }, { quoted: ms });
    } catch (error) {
        console.error("Menu error: ", error);
        respond("An error occurred while generating the menu. Please try again later.");
    }
});
