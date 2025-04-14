const { keith } = require("../keizzah/keith");
const axios = require('axios');
const { sendMessage, repondre } = require(__dirname + "/../keizzah/context");

keith({
  nomCom: "gpt",
  aliases: ["gpt4", "ai"],
  reaction: '👻',
  categorie: "AI"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;
  const query = arg.join(" ").trim(); // Get the user's query

  if (!query) {
    return repondre(zk, dest, ms, "Please provide a message.");
  }

  try {
    // Fetch response from the API
    const response = await axios.get(`https://apis-keith.vercel.app/ai/gpt?q=${encodeURIComponent(query)}`);

    // Handle API response validation
    if (response.data?.status && response.data?.result) {
      const aiResponse = response.data.result;

      // Send the AI response to the user
      await sendMessage(zk, dest, ms, {
        text: aiResponse,
        contextInfo: {
          externalAdReply: {
            title: "BELTAH MD GPT4",
            body: "KEEP LEARNING WITH BELTAH-MD",
            thumbnailUrl: "https://telegra.ph/file/dcce2ddee6cc7597c859a.jpg", // Environment variable or fallback URL
            sourceUrl: "https://whatsapp.com/channel/0029VaRHDBKKmCPKp9B2uH2F", // Environment variable or fallback URL
            mediaType: 1,
            showAdAttribution: true, // Verified badge
          },
        },
      });
    } else {
      repondre(zk, dest, ms, "Failed to get a valid response from the AI.");
    }
  } catch (error) {
    console.error("Error fetching GPT response:", error.message || error);
    repondre(zk, dest, ms, "Sorry, an error occurred while processing your request. Please try again later.");
  }
});
