const { keith } = require('../keizzah/keith');
const Heroku = require('heroku-client');
const settings = require("../set");
const axios = require("axios");
const speed = require("performance-now");
const { exec } = require("child_process");
const { repondre } = require(__dirname + "/../keizzah/context");

// Function to create a delay
function delay(ms) {
  console.log(`⏱️ Delay for ${ms}ms`);
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Format the uptime into a human-readable string
function formatUptime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsLeft = Math.floor(seconds % 60);

  return `BOT UPTIME : 0 ᴅᴀʏs, ${hours} ʜᴏᴜʀs, ${minutes} ᴍɪɴᴜᴛᴇs, ${secondsLeft} sᴇᴄᴏɴᴅs`;
}

// Constants
const DEFAULT_PARTICIPANT = '0@s.whatsapp.net';
const DEFAULT_REMOTE_JID = 'status@broadcast';
const DEFAULT_THUMBNAIL_URL = 'https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg';
const DEFAULT_TITLE = "BELTAH TECH BOT";
const DEFAULT_BODY = "Your AI Assistant Chuddy Buddy";

// Default message configuration
const fgg = {
  key: {
    fromMe: false,
    participant: DEFAULT_PARTICIPANT,
    remoteJid: DEFAULT_REMOTE_JID,
  },
  message: {
    contactMessage: {
      displayName: `Beltah Tech Info`,
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;BELTAH MD;;;\nFN:BELTAH MD\nitem1.TEL;waid=${DEFAULT_PARTICIPANT.split('@')[0]}:${DEFAULT_PARTICIPANT.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
    },
  },
};

/**
 * Construct contextInfo object for messages.
 * @param {string} title - Title for the external ad reply.
 * @param {string} userJid - User JID to mention.
 * @param {string} thumbnailUrl - Thumbnail URL.
 * @returns {object} - ContextInfo object.
 */
function getContextInfo(title = DEFAULT_TITLE, userJid = DEFAULT_PARTICIPANT, thumbnailUrl = DEFAULT_THUMBNAIL_URL) {
  try {
    return {
      mentionedJid: [userJid],
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
         newsletterJid: "120363249464136503@newsletter",
         newsletterName: "🤖 𝐁𝐄𝐋𝐓𝐀𝐇 𝐀𝐈 𝐂𝐇𝐀𝐓𝐁𝐎𝐓 🤖",
         serverMessageId: Math.floor(100000 + Math.random() * 900000),
     },
      externalAdReply: {
        showAdAttribution: true,
        title,
        body: DEFAULT_BODY,
        thumbnailUrl,
        sourceUrl: conf.GURL || '',
      },
    };
  } catch (error) {
    console.error(`Error in getContextInfo: ${error.message}`);
    return {}; // Prevent breaking on error
  }
           }


// Command to restart the bot
keith({
  nomCom: 'restart',
  aliases: ['reboot'],
  categorie: "system"
}, async (chatId, zk, context) => {
  const { repondre, superUser } = context;

  // Check if the user is a super user
  if (!superUser) {
    return repondre("You need owner privileges to execute this command!");
  }

  try {
    // Inform the user that the bot is restarting
    await repondre("> *BELTAH-MD is Restarting from the server...*");

    // Wait for 3 seconds before restarting
    await delay(3000);

    // Exit the process to restart the bot
    process.exit();
  } catch (error) {
    console.error("Error during restart:", error);
  }
});

// Command to retrieve Heroku config vars
keith({
  nomCom: 'allvar',
  categorie: "system"
}, async (chatId, zk, context) => {
  const { repondre, superUser } = context;

  // Check if the command is issued by the owner
  if (!superUser) {
    return repondre("*This command is restricted to the bot owner or Beltah Tech owner 💀*");
  }

  const appName = settings.HEROKU_APP_NAME;
  const herokuApiKey = settings.HEROKU_API_KEY;

  const heroku = new Heroku({
    token: herokuApiKey,
  });

  const baseURI = `/apps/${appName}/config-vars`;

  try {
    // Fetch config vars from Heroku API
    const configVars = await heroku.get(baseURI);

    let responseMessage = '*╭───༺𝗕𝗘𝗟𝗧𝗔𝗛-𝗠𝗗  𝗔𝗟𝗟 𝗩𝗔𝗥༻────╮*\n\n';
    
    // Loop through the returned config vars and format them
    for (let key in configVars) {
      if (configVars.hasOwnProperty(key)) {
        responseMessage += `★ *${key}* = ${configVars[key]}\n`;
      }
    }

    // Send the formatted response back to the user
    repondre(responseMessage);

  } catch (error) {
    console.error('Error fetching Heroku config vars:', error);
    repondre('Sorry, there was an error fetching the config vars.');
  }
});

// Command to set a Heroku config var
keith({
  nomCom: 'setvar',
  categorie: "system"
}, async (chatId, zk, context) => {
  const { repondre, superUser, arg } = context;

  // Check if the command is issued by the owner
  if (!superUser) {
    return repondre("*This command is restricted to the bot owner or Beltah Tech*");
  }

  const appName = settings.HEROKU_APP_NAME;
  const herokuApiKey = settings.HEROKU_API_KEY;

  if (!arg || arg.length !== 1 || !arg[0].includes('=')) {
    return repondre('Incorrect Usage:\nProvide the key and value correctly.\nExamples: \n\n> setvar OWNER_NAME=Beltah Tech\n> setvar AUTO_READ_MESSAGES=no');
  }

  const [key, value] = arg[0].split('=');

  const heroku = new Heroku({
    token: herokuApiKey,
  });

  const baseURI = `/apps/${appName}/config-vars`;

  try {
    // Set the new config var
    await heroku.patch(baseURI, {
      body: {
        [key]: value,
      },
    });

    // Notify success
    await repondre(`*✅ The variable ${key} = ${value} has been set successfully. The bot is restarting...*`);
  } catch (error) {
    console.error('Error setting config variable:', error);
    await repondre(`❌ There was an error setting the variable. Please try again later.\n${error.message}`);
  }
});

// Command to execute shell commands
keith({
  nomCom: "shell",
  aliases: ["getcmd", "cmd"],
  reaction: '🗿',
  categorie: "system"
}, async (context, message, params) => {
  const { repondre: sendResponse, arg: commandArgs, superUser: Owner, auteurMessage } = params;

  // Ensure that the sender is the superuser (Owner)
  if (!Owner) {
    return sendResponse("You are not authorized to execute shell commands.");
  }

  const command = commandArgs.join(" ").trim();

  // Ensure the command is not empty
  if (!command) {
    return sendResponse("Please provide a valid shell command.");
  }

  // Execute the shell command
  exec(command, (err, stdout, stderr) => {
    if (err) {
      return sendResponse(`Error: ${err.message}`);
    }

    if (stderr) {
      return sendResponse(`stderr: ${stderr}`);
    }

    if (stdout) {
      return sendResponse(stdout);
    }

    // If there's no output, let the user know
    return sendResponse("Command executed successfully, but no output was returned.");
  });
});


// Command to update and redeploy the bot
keith({
  nomCom: 'update',
  aliases: ['redeploy', 'sync'],
  categorie: "system",
}, async (chatId, zk, context) => {
  const { repondre, superUser } = context;

  // Ensure the command is issued by the owner
  if (!superUser) {
    return repondre("*❌ Access Denied: This operation is restricted to the bot owner or Beltah Tech.*");
  }

  // Retrieve Heroku app name and API key from settings
  const herokuAppName = settings.HEROKU_APP_NAME;
  const herokuApiKey = settings.HEROKU_API_KEY;

  // Validate Heroku configuration
  if (!herokuAppName || !herokuApiKey) {
    await repondre(
      "*❌ Configuration Missing:*\n\n" +
      "🛠️ Ensure that `HEROKU_APP_NAME` and `HEROKU_API_KEY` are properly set in the environment variables."
    );
    return;
  }

  // Centralized redeployment logic
  async function redeployApp() {
    const herokuUrl = `https://api.heroku.com/apps/${herokuAppName}/builds`;
    const sourceBlobUrl = "https://github.com/Beltahinfo/Beltah-xmd/tarball/main";

    try {
      // Notify the user about the redeployment start
      await repondre(
        "*⚙️ INITIATED: Deploying updates to BELTAH-MD...*\n\n" +
        "```Loading payload...``` 🔗\n" +
        "```Injecting binaries...``` 💾\n" +
        "```Establishing secure uplink with Heroku...``` 🌐\n\n" +
        "*🛸 SYSTEM ONLINE:* Deployment in progress. ETA ~5 minutes.\n\n" +
        "```RESETTING SYSTEM INTEGRITY...``` 🔄\n" +
        "```UPGRADING INFRASTRUCTURE...``` 🛠️\n\n" +
        "*Stay Tuned, Operator. The system shall evolve...*"
      );

      // Trigger the Heroku build via API
      const response = await axios.post(
        herokuUrl,
        { source_blob: { url: sourceBlobUrl } },
        {
          headers: {
            Authorization: `Bearer ${herokuApiKey}`,
            Accept: "application/vnd.heroku+json; version=3",
          },
        }
      );

      // Notify the user about successful deployment initiation
      console.log("Heroku Build Details:", response.data);
    } catch (error) {
      // Handle and log errors during the redeployment process
      const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred.";
      await repondre(
        `*❌ DEPLOYMENT FAILED:*\n\n` +
        "```Execution halted.``` 🚨\n" +
        `**Error:** ${errorMessage}\n\n` +
        "*🛠️ Debugging required: Verify Heroku API key and app name.*"
      );
      console.error("Error triggering Heroku redeploy:", errorMessage);
    }
  }

  // Execute the redeployment process
  try {
    await redeployApp();
  } catch (error) {
    console.error("Unexpected error during redeployment:", error.message);
    await repondre(
      "*❌ CRITICAL ERROR:*\n\n" +
      "```System malfunction detected.``` 🔥\n" +
      "```Reverting operations...``` ⏳\n\n" +
      "*Operator, please retry the deployment after resolving the issue.*"
    );
  }
});

/*// Command to update and redeploy the bot
keith({
  nomCom: 'update',
  aliases: ['redeploy', 'sync'],
  categorie: "system"
}, async (chatId, zk, context) => {
  const { repondre, superUser } = context;

  // Check if the command is issued by the owner
  if (!superUser) {
    return repondre("*This command is restricted to the bot owner or Beltah Tech*");
  }

  // Ensure Heroku app name and API key are set
  const herokuAppName = settings.HEROKU_APP_NAME;
  const herokuApiKey = settings.HEROKU_API_KEY;

  // Check if Heroku app name and API key are set in environment variables
  if (!herokuAppName || !herokuApiKey) {
    await repondre("It looks like the Heroku app name or API key is not set. Please make sure you have set the `HEROKU_APP_NAME` and `HEROKU_API_KEY` environment variables.");
    return;
  }

  // Function to redeploy the app
  async function redeployApp() {
    try {
      const response = await axios.post(
        `https://api.heroku.com/apps/${herokuAppName}/builds`,
        {
          source_blob: {
            url: "https://github.com/Beltahinfo/Beltah-xmd/tarball/main",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${herokuApiKey}`,
            Accept: "application/vnd.heroku+json; version=3",
          },
        }
      );

      // Notify the user about the update and redeployment
      await repondre("*BELTAH-MD Syncing updates, wait 5 minutes for the redeploy to finish!*\n\n *This will install the latest version of ʙᴇʟᴛᴀʜ ʙᴏᴛ.*");
      console.log("Build details:", response.data);
    } catch (error) 
      // Handle any errors during the redeployment process
      const errorMessage = error.response?.data || error.message;
      await repondre(`*Failed to update and redeploy. ${errorMessage} Please check if you have set the Heroku API key and Heroku app name correctly.*`);
      console.error("Error triggering redeploy:", errorMessage);
    }
  }

  // Trigger the redeployment function
  redeployApp();
});*/

//These improvements include enhanced readability, better error handling, and more modular code structure, which makes the code easier to maintain and debug.
