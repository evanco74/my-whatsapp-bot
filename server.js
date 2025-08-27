const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

// Get verify token from environment variables
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "dev_secret_token";

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
app.post("/webhook", (req, res) => {
  console.log("📩 INCOMING:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

// Render (and Heroku) will provide process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
});
