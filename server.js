const express = require("express");
require("dotenv").config();
const axios = require("axios");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "dev_secret_token";
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// Store users who already got the welcome
const greetedUsers = new Set();

// Verification endpoint
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ WEBHOOK_VERIFIED");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Incoming messages
app.post("/webhook", async (req, res) => {
  console.log("📩 INCOMING:", JSON.stringify(req.body, null, 2));

  if (req.body.object) {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0]?.value;
    const message = changes?.messages?.[0];

    if (message) {
      const from = message.from; // customer’s WhatsApp number
      const text = message.text?.body || "";

      console.log(`📲 Message from ${from}: ${text}`);

      try {
        // Send welcome only if user hasn't been greeted
        if (!greetedUsers.has(from)) {
          await axios.post(
            `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
            {
              messaging_product: "whatsapp",
              to: from,
              text: { body: "🤖 Hi there! Thanks for messaging us. How can I help you today?" },
            },
            {
              headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json",
              },
            }
          );
          greetedUsers.add(from); // mark user as greeted
        }

        // Echo back what they said
        if (text) {
          await axios.post(
            `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
            {
              messaging_product: "whatsapp",
              to: from,
              text: { body: `You said: ${text}` },
            },
            {
              headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json",
              },
            }
          );
        }

        console.log("✅ Reply sent!");
      } catch (err) {
        console.error("❌ Error sending message:", err.response?.data || err.message);
      }
    }
  }

  res.sendStatus(200);
});

// Render provides PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
});
