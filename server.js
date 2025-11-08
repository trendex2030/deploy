const express = require("express");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const HEROKU_API_KEY = process.env.HEROKU_API_KEY;
const PORT = process.env.PORT || 3000;

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

// Deploy endpoint
app.post("/deploy-bot", async (req, res) => {
  try {
    const { appName, sourceUrl, env } = req.body;
    if (!HEROKU_API_KEY) return res.status(400).json({ error: "Missing HEROKU_API_KEY on server." });
    if (!appName || !sourceUrl) return res.status(400).json({ error: "appName and sourceUrl are required." });

    const headers = {
      Authorization: `Bearer ${HEROKU_API_KEY}`,
      Accept: "application/vnd.heroku+json; version=3",
      "Content-Type": "application/json"
    };

    // 1) Create app
    const appResp = await axios.post("https://api.heroku.com/apps", { name: appName }, { headers });

    // 2) Set config vars (optional)
    if (env && typeof env === "object") {
      await axios.patch(
        `https://api.heroku.com/apps/${appResp.data.id}/config-vars`,
        env,
        { headers }
      );
    }

    // 3) Trigger build from source archive
    const buildResp = await axios.post(
      `https://api.heroku.com/apps/${appResp.data.id}/builds`,
      {
        source_blob: {
          url: sourceUrl
        }
      },
      { headers }
    );

    res.json({
      message: "Deployment started",
      herokuAppName: appResp.data.name,
      dashboard: `https://dashboard.heroku.com/apps/${appResp.data.name}`,
      buildId: buildResp.data.id,
      status: buildResp.data.status
    });
  } catch (error) {
    const msg = error.response?.data?.message || error.response?.data?.error || error.message;
    res.status(500).json({ error: msg });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
