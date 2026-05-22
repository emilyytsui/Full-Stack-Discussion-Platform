const express = require("express");
const router = express.Router();
const LinkFlair = require("../models/linkflairs");

// Get all link flairs
router.get("/", async (req, res) => {
  try {
    const linkFlairs = await LinkFlair.find();
    res.status(200).json(linkFlairs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
