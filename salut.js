"use strict";

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  delay,
  jidDecode,
  downloadContentFromMessage
} = require("@whiskeysockets/baileys");

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

async function listCommands() {
  const commandsDir = path.join(__dirname, "commands");
  const commandFiles = fs.readdirSync(commandsDir);
  const commands = [];

  for (const file of commandFiles) {
    if (file.endsWith(".js")) {
      commands.push(file.replace(".js", ""));
    }
  }

  return commands;
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
      logger.info("Connected successfully!");

      // Notify about bot connection
      await sock.sendMessage(zk.user.id, {
        text: "Beltah md bot is now connected! 🎉"
      });

      // Notify about command installation
      const commands = await listCommands();
      const commandListText = commands.length > 0
        ? `The following commands have been successfully installed:\n- ${commands.join("\n- ")}`
        : "No commands found in the './commands' directory.";

      await sock.sendMessage(zk.user.id, {
        text: commandListText
      });

      logger.info("Commands have been listed and sent.");
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
    const { messages } = msg;
    const message = messages[0];
    if (!message?.message) return;

    const messageType = Object.keys(message.message)[0];
    const chatId = message.key.remoteJid;
    const senderId = message.key.participant || chatId;

    logger.info(`Received message of type ${messageType} from ${senderId}`);

    if (messageType === "conversation" || messageType === "extendedTextMessage") {
      const text = message.message.conversation || message.message.extendedTextMessage.text;
      if (text.startsWith(conf.PREFIXE)) {
        const command = text.slice(conf.PREFIXE.length).split(" ")[0].toLowerCase();
        logger.info(`Command received: ${command}`);
      }
    }
  });

  sock.ev.on("call", async (callData) => {
    if (conf.ANTICALL === "yes") {
      for (const call of callData) {
        const callId = call.id;
        const callerId = call.from;
        await sock.rejectCall(callId, callerId);
        logger.info(`Rejected call from ${callerId}`);
      }
    }
  });

  setInterval(() => {
    const bio = `BELTAH-MD: Active at ${new Date().toLocaleString()}`;
    sock.updateProfileStatus(bio);
    logger.info("Updated profile status");
  }, 60 * 1000);
}

main();
