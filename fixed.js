"use strict";

// Importing dependencies
const {
  makeInMemoryStore,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  delay,
  DisconnectReason,
  default: makeWASocket,
} = require("@whiskeysockets/baileys");
const logger = require("@whiskeysockets/baileys/lib/Utils/logger").default.child(
  {}
);
const pino = require("pino");
const axios = require("axios");
const { DateTime } = require("luxon");
const { Boom } = require("@hapi/boom");
const fs = require("fs-extra");
const path = require("path");
const FileType = require("file-type");
const { Sticker, createSticker, StickerTypes } = require("wa-sticker-formatter");
const conf = require("./set");
const {
  verifierEtatJid,
  recupererActionJid,
} = require("./bdd/antilien");
const {
  atbverifierEtatJid,
  atbrecupererActionJid,
} = require("./bdd/antibot");
const { isUserBanned, addUserToBanList, removeUserFromBanList } = require("./bdd/banUser");
const {
  addGroupToBanList,
  isGroupBanned,
  removeGroupFromBanList,
} = require("./bdd/banGroup");
const {
  isGroupOnlyAdmin,
  addGroupToOnlyAdminList,
  removeGroupFromOnlyAdminList,
} = require("./bdd/onlyAdmin");
const { reagir } = require(__dirname + "/keizzah/app");
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config({ path: "./config.env" });

// Logger configuration
logger.level = "silent";

// Configurations
let session = conf.session.replace(/BELTAH-MD;;;=>/g, "");
const prefixe = conf.PREFIXE || [];

// Function: Authentication
async function authentification() {
  try {
    const authPath = __dirname + "/auth/creds.json";
    if (!fs.existsSync(authPath)) {
      console.log("Sessions Connected successfully...");
      await fs.writeFileSync(authPath, atob(session), "utf8");
    } else if (fs.existsSync(authPath) && session !== "zokk") {
      await fs.writeFileSync(authPath, atob(session), "utf8");
    }
  } catch (e) {
    console.error("Session Invalid:", e);
  }
}

// Function: Main bot logic
async function main() {
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState(__dirname + "/auth");

  const store = makeInMemoryStore({ logger: pino().child({ level: "silent" }) });
  const zk = makeSock({ version, state, store });

  store.bind(zk.ev);
  storePersist(store);
  handleConnectionEvents(zk);
  handleCredsUpdate(zk, saveCreds);

  // Watch for file changes and reload
  watchFileReload();
}

// Function: Create socket options
function makeSock({ version, state, store }) {
  return makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    browser: ["BELTAH-MD", "safari", "1.0.0"],
    auth: {
      creds: state.creds,
      keys: state.keys,
    },
    getMessage: async (key) => {
      if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id, undefined);
        return msg.message || undefined;
      }
      return { conversation: "An Error Occurred, Repeat Command!" };
    },
  });
}

// Function: Persist store to file
function storePersist(store) {
  setInterval(() => {
    store.writeToFile("store.json");
  }, 3000);
}

// Function: Handle connection events
function handleConnectionEvents(zk) {
  zk.ev.on("connection.update", async (con) => {
    const { connection, lastDisconnect } = con;

    if (connection === "connecting") {
      console.log("ℹ️ Connecting...");
    } else if (connection === "open") {
      console.log("✅ Connection successful! Beltah MD bot is online 🕸");

      // Send message directly to the linked account with time and date
      try {
        const accountJid = zk.user.id; // Automatically get the bot's account JID
        const now = DateTime.now().setZone("Africa/Nairobi").toFormat(
          "yyyy-MM-dd HH:mm:ss"
        ); // Get current Nairobi time
        const message = `✅ Beltah MD bot is connected successfully and ready to use! \n\n📅 Date: ${
          now.split(" ")[0]
        } \n🕒 Time: ${now.split(" ")[1]} Africa/Nairobi Time`;

        await zk.sendMessage(accountJid, { text: message });
        console.log("✅ Notification sent to the account.");
      } catch (err) {
        console.error("❌ Failed to send notification:", err);
      }

      loadCommands();
    } else if (connection === "close") {
      handleDisconnection(con, zk);
    }
  });
}

// Function: Handle disconnection
function handleDisconnection({ lastDisconnect }, zk) {
  const reason = new Boom(lastDisconnect?.error)?.output.statusCode;

  switch (reason) {
    case DisconnectReason.badSession:
      console.log("Invalid session ID, please rescan the QR code...");
      break;
    case DisconnectReason.connectionClosed:
    case DisconnectReason.connectionLost:
      console.log("Connection lost, reconnecting...");
      main();
      break;
    case DisconnectReason.connectionReplaced:
      console.log("Connection replaced, a session is already open.");
      break;
    case DisconnectReason.loggedOut:
      console.log("Logged out, please rescan the QR code.");
      break;
    case DisconnectReason.restartRequired:
      console.log("Restarting...");
      main();
      break;
    default:
      console.error("Unexpected error, restarting...", reason);
      require("child_process").exec("pm2 restart all");
      main();
  }
}

// Function: Handle credentials update
function handleCredsUpdate(zk, saveCreds) {
  zk.ev.on("creds.update", saveCreds);
}

// Function: Load commands dynamically
function loadCommands() {
  console.log("Loading commands...");
  fs.readdirSync(__dirname + "/commands").forEach((file) => {
    if (path.extname(file).toLowerCase() === ".js") {
      try {
        require(__dirname + "/commands/" + file);
        console.log(`${file} loaded ✔️`);
      } catch (e) {
        console.error(`Failed to load ${file}:`, e);
      }
    }
  });
}

// Function: Watch file reload
function watchFileReload() {
  const file = require.resolve(__filename);
  fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(`File updated: ${file}`);
    delete require.cache[file];
    require(file);
  });
}

// Webhook server
const app = express();
app.use(bodyParser.json());

// Webhook endpoint to receive GitHub events
app.post("/webhook", async (req, res) => {
  try {
    const event = req.headers["x-github-event"];
    const payload = req.body;

    if (event === "push") {
      const repoName = payload.repository.name;
      const pusher = payload.pusher.name;
      const commits = payload.commits
        .map((commit) => `- ${commit.message} (${commit.id.slice(0, 7)})`)
        .join("\n");
      const now = DateTime.now().setZone("Africa/Nairobi").toFormat(
        "yyyy-MM-dd HH:mm:ss"
      );

      const message = `🚀 Repository Update Notification\n\n📂 Repo: ${repoName}\n👤 Pusher: ${pusher}\n📅 Date: ${
        now.split(" ")[0]
      }\n🕒 Time: ${
        now.split(" ")[1]
      } Africa/Nairobi Time\n\n🔄 Recent Commits:\n${commits}`;

      // Send the notification
      const zk = makeWASocket(); // Ensure the bot is connected
      await zk.sendMessage(zk.user.id, { text: message });
      console.log("✅ Notification sent for repository update.");
    }

    res.status(200).send("Event received");
  } catch (error) {
    console.error("❌ Failed to handle webhook event:", error);
    res.status(500).send("Error handling event");
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
});

// Launch the bot
authentification();
setTimeout(main, 5000);
