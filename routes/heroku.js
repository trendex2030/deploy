const express = require("express");
const axios = require("axios");
const router = express.Router();

const HEROKU_API_KEY = process.env.HEROKU_API_KEY;
const HEROKU_EMAIL = process.env.HEROKU_EMAIL;
const GITHUB_REPO = process.env.GITHUB_REPO;

const headers = {
  Authorization: `Bearer ${HEROKU_API_KEY}`,
  Accept: "application/vnd.heroku+json; version=3"
};

// Create a new Heroku app
router.post("/create-app", async (req, res) => {
  const { appName, sessionId } = req.body;

  try {
    // Step 1: Create app
    const appResp = await axios.post(
      "https://api.heroku.com/apps",
      { name: appName },
      { headers }
    );

    // Step 2: Set config vars
    await axios.patch(
      `https://api.heroku.com/apps/${appName}/config-vars`,
      { SESSION_ID: sessionId },
      { headers }
    );

    // Step 3: Deploy from GitHub (via Heroku GitHub integration)
    // Simplest way: tell user to connect repo manually OR use pipelines

    res.json({ success: true, app: appResp.data });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create app" });
  }
});

module.exports = router;
