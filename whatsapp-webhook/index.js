const express = require("express");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "my_secret_token"; // choose anything

// Verification
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

app.listen(3000, () => console.log("🚀 Webhook server running on port 3000"));
