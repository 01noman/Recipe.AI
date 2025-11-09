// server.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Middleware to parse JSON body
app.use(express.json());

// Simple home route
app.get("/", (req, res) => {
  res.send("✅ Recipe API is running!");
});

// Main API route
app.post("/api/recipe", async (req, res) => {
  try {
    console.log("Incoming body:", req.body);

    const { ingredients } = req.body;
    if (!ingredients) {
      return res.status(400).json({ error: "No ingredients provided" });
    }

    // Send to your n8n webhook securely
    const response = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.API_KEY
      },
      body: JSON.stringify({ ingredients })
    });

    console.log("n8n status:", response.status);
    const text = await response.text();
    console.log("n8n response:", text);

    if (!response.ok) throw new Error(`n8n returned ${response.status}`);

    res.send(text);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      details: err.message
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Recipe API running on port ${PORT}`));
