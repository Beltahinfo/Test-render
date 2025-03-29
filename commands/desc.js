const { keith } = require(__dirname + "/../keizzah/keith");
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

// Function to convert text to fancy uppercase font
const toFancyUppercaseFont = (text) => {
    const fonts = {
        'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌',
        'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙'
    };
    return typeof text === 'string' ? text.split('').map(char => fonts[char] || char).join('') : text;
}

// Function to convert text to fancy lowercase font
const toFancyLowercaseFont = (text) => {
    const fonts = {
        'a': '𝚊', 'b': '𝚋', 'c': '𝚌', 'd': '𝚍', 'e': '𝚎', 'f': '𝚏', 'g': '𝚐', 'h': '𝚑', 'i': '𝚒', 'j': '𝚓', 'k': '𝚔', 'l': '𝚕', 'm': '𝚖',
        'n': '𝚗', 'o': '𝚘', 'p': '𝚙', 'q': '𝚚', 'r': '𝚛', 's': '𝚜', 't': '𝚝', 'u': '𝚞', 'v': '𝚟', 'w': '𝚠', 'x': '𝚡', 'y': '𝚢', 'z': '𝚣'
    };
    return typeof text === 'string' ? text.split('').map(char => fonts[char] || char).join('') : text;
}

// Command to list all bot commands along with descriptions and aliases
keith({
    nomCom: "desc",
    reaction: "🙂‍↕️",
    aliases: ["panelist", "commandlist", "cmdlist", "list"],
    desc: "Get bot command list.",
    categorie: "universal"
}, async (dest, zk, context) => {
    const { respond, prefix, nomAuteurMessage } = context;
    const commands = require(__dirname + "/../keizzah/keith").cm;

    let menu = '𝗕𝗘𝗟𝗧𝗔𝗛-𝗠𝗗 𝗕𝗢𝗧\n\n';
    let keithList = [];

    // Loop through all commands to fetch the relevant information (commands, description, and aliases)
    commands.forEach((command) => {
        const { nomCom, desc = 'No description available', aliases = 'No aliases', categorie, reaction } = command;

        // Ensure no command with undefined 'nomCom' gets added
        if (nomCom) {
            keithList.push({ nomCom, desc, aliases, categorie, reaction });
        }
    });

    // Sort the command list alphabetically by command name
    keithList.sort((a, b) => a.nomCom.localeCompare(b.nomCom));

    // Format and add each command, description, and alias to the menu
    keithList.forEach(({ nomCom, desc, aliases, categorie, reaction }, index) => {
        menu += `${index + 1}. ${toFancyUppercaseFont(nomCom.trim())}\n`;
        menu += `Description: ${toFancyLowercaseFont(desc)}\n`;
        menu += `Aliases: ${toFancyLowercaseFont(aliases)}\n`;
        menu += `Category: ${toFancyLowercaseFont(categorie)}\n`;
        menu += `Reaction: ${toFancyLowercaseFont(reaction)}\n\n`;
    });

    // Send the formatted menu as a message
    return 
    await client.sendMessage(command, {
            text: menu, 
            contextInfo: getContextInfo("𝗕𝗘𝗟𝗧𝗔𝗛 𝗠𝗨𝗟𝗧𝗜 𝗗𝗘𝗩𝗜𝗖𝗘", senderName, 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg' )
        }, { quoted: ms });
});
