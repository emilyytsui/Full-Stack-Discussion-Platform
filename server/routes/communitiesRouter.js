const express = require("express");
const router = express.Router();

const Communities = require("../models/communities");
const { requireUser } = require("../middleware/auth");
const { deleteCommunityCascade } = require("../utils/deleteHelpers");

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Get all communities
router.get("/", async (_req, res) => {
  try {
    const communities = await Communities.find().populate(
      "createdBy",
      "displayName",
    );

    res.status(200).json(communities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new community
router.post("/", requireUser, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name?.trim() || !description?.trim()) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    const existingCommunity = await Communities.findOne({
      name: { $regex: new RegExp(`^${escapeRegex(trimmedName)}$`, "i") },
    });

    if (existingCommunity) {
      return res
        .status(400)
        .json({ error: "A community with this name already exists" });
    }

    const newCommunity = await Communities.create({
      name: trimmedName,
      description: trimmedDescription,
      members: [req.currentUser._id],
      createdBy: req.currentUser._id,
    });

    const populatedCommunity = await Communities.findById(
      newCommunity._id,
    ).populate("createdBy", "displayName");

    return res.status(201).json(populatedCommunity);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.put("/:id", requireUser, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name?.trim() || !description?.trim()) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const community = await Communities.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    const isOwner = String(community.createdBy) === String(req.currentUser._id);

    if (!isOwner && !req.currentUser.isAdmin) {
      return res
        .status(403)
        .json({ error: "Not allowed to edit this community" });
    }

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    const duplicateCommunity = await Communities.findOne({
      name: { $regex: new RegExp(`^${escapeRegex(trimmedName)}$`, "i") },
      _id: { $ne: community._id },
    });

    if (duplicateCommunity) {
      return res
        .status(400)
        .json({ error: "A community with this name already exists" });
    }

    community.name = trimmedName;
    community.description = trimmedDescription;
    await community.save();

    const populatedCommunity = await Communities.findById(
      community._id,
    ).populate("createdBy", "displayName");

    return res.status(200).json(populatedCommunity);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", requireUser, async (req, res) => {
  try {
    const community = await Communities.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    const isOwner = String(community.createdBy) === String(req.currentUser._id);

    if (!isOwner && !req.currentUser.isAdmin) {
      return res
        .status(403)
        .json({ error: "Not allowed to delete this community" });
    }

    await deleteCommunityCascade(community._id);
    return res.status(200).json({ message: "Community deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Join community
router.patch("/:id/join", requireUser, async (req, res) => {
  try {
    const community = await Communities.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    const isMember = (community.members ?? []).some(
      (memberId) => String(memberId) === String(req.currentUser._id),
    );

    if (!isMember) {
      community.members.push(req.currentUser._id);
      await community.save();
    }

    const populatedCommunity = await Communities.findById(
      community._id,
    ).populate("createdBy", "displayName");

    return res.status(200).json(populatedCommunity);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Leave community
router.patch("/:id/leave", requireUser, async (req, res) => {
  try {
    const community = await Communities.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    community.members = (community.members ?? []).filter(
      (memberId) => String(memberId) !== String(req.currentUser._id),
    );

    await community.save();

    const populatedCommunity = await Communities.findById(
      community._id,
    ).populate("createdBy", "displayName");

    return res.status(200).json(populatedCommunity);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
