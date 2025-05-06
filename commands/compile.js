const { exec } = require('child_process');
const { keith } = require("../keizzah/keith");
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { ajouterOuMettreAJourJid, mettreAJourAction, verifierEtatJid } = require("../bdd/antilien");
const { atbajouterOuMettreAJourJid, atbverifierEtatJid } = require("../bdd/antibot");
const { search, download } = require("aptoide-scraper");
const fs = require("fs-extra");
const conf = require("../set");
const { default: axios } = require('axios');
const { getBinaryNodeChild, getBinaryNodeChildren } = require('@whiskeysockets/baileys').default;


const NEWS_LETTER_JID = "120363249464136503@newsletter"; // Replace with your real one
const BOT_NAME = "𝐁𝐄𝐋𝐓𝐀𝐇 𝐓𝐄𝐂𝐇 © 𝟐𝟎𝟐𝟓";
const DEFAULT_THUMBNAIL = "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg";

// Define the createContext function for enhanced context display
const createContext = (userJid, options = {}) => ({
    contextInfo: {
        mentionedJid: [userJid], // Tag user if needed
        forwardingScore: 999,
        isForwarded: true,
        businessMessageForwardInfo: {
            businessOwnerJid: NEWS_LETTER_JID, // Helps add verified feel
        },
        forwardedNewsletterMessageInfo: {
            newsletterJid: NEWS_LETTER_JID,
            newsletterName: options.newsletterName || BOT_NAME,
            serverMessageId: Math.floor(100000 + Math.random() * 900000)
        },
        externalAdReply: {
            title: options.title || BOT_NAME,
            body: options.body || "Premium WhatsApp Bot Solution",
            thumbnailUrl: options.thumbnail || DEFAULT_THUMBNAIL,
            mediaType: 1,
            mediaUrl: options.mediaUrl || undefined,
            sourceUrl: options.sourceUrl || "https://wa.me/254728782591", // link to bot or business
            showAdAttribution: true,
            renderLargerThumbnail: false 
        }
    }
});

keith({
    nomCom: "compile",
    aliases: ["savecontact", "savecontacts"], // Adding aliases
    categorie: 'Group',
    reaction: "🎉"
}, async (dest, zk, commandeOptions) => {
    const { repondre, verifGroupe, verifAdmin, ms } = commandeOptions;

    if (!verifAdmin) {
        repondre("You are not an admin here!");
        return;
    }

    if (!verifGroupe) {
        repondre("This command works in groups only");
        return;
    }

    try {
        let metadat = await zk.groupMetadata(dest);
        const partic = await metadat.participants;

        let vcard = '';
        let noPort = 0;

        for (let a of partic) {
            // Get the participant's phone number
            let phoneNumber = a.id.split("@")[0];

            // Use the participant's name or default to "[FMD] Phone Number" if no name is found
            let contactName = a.name || a.notify || `[ʙᴇʟᴛᴀʜ-ᴍᴅ] +${phoneNumber}`;

            vcard += `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nTEL;type=CELL;type=VOICE;waid=${phoneNumber}:+${phoneNumber}\nEND:VCARD\n`;
        }

        let cont = './contacts.vcf';

        await repondre(`A moment, *BELTAH-MD* is compiling ${partic.length} contacts into a vcf...`);

        await fs.writeFileSync(cont, vcard.trim());

        await zk.sendMessage(dest, {
            document: fs.readFileSync(cont),
            mimetype: 'text/vcard',
            fileName: `${metadat.subject}.Vcf`,
            caption: `𝐁𝐄𝐋𝐓𝐀𝐇 𝐌𝐃\n\nᴛᴏᴛᴀʟ ᴄᴏɴᴛᴀᴄᴛs : ${partic.length} \n\nᴠᴄғ ғᴏʀ : ${metadat.subject}\n\n> *ᴋᴇᴇᴘ ᴜsɪɴɢ ʙᴇʟᴛᴀʜ-ᴍᴅ*`,
            ...createContext(dest, {
                title: "BELTAH-MD BOT",
                body: "ʏᴏᴜ ᴄᴀɴ ɴᴏᴡ ɪᴍᴘᴏʀᴛ ᴛᴏ ʏᴏᴜʀ ᴅᴇᴠɪᴄᴇ",
                thumbnail: "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg",
                mediaUrl: "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg",
                sourceUrl: 'https://whatsapp.com/channel/0029VaRHDBKKmCPKp9B2uH2F'
            })
        }, { ephemeralExpiration: 86400, quoted: ms });

        fs.unlinkSync(cont);
    } catch (error) {
        console.error("Error while creating or sending VCF:", error.message || error);
        repondre("An error occurred while creating or sending the VCF. Please try again.");
    }
});
