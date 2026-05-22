const express = require("express");
const router = express.Router();
const Posts = require("../models/posts");
const Communities = require("../models/communities");
const LinkFlairs = require("../models/linkflairs");
const Users = require("../models/users");
const { requireAuth } = require("../middleware/auth");
const { deletePostCascade } = require("../utils/deleteHelpers");
const { applyVote } = require("../utils/voteHelpers");

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Posts.find().populate("postedBy", "displayName");
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Increment views for a post
router.patch("/:id/views", async (req, res) => {
  try {
    const updatedPost = await Posts.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { returnDocument: "after" },
    );

    if (!updatedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    await updatedPost.populate("postedBy", "displayName");
    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vote on a post
router.patch("/:id/vote", requireAuth, async (req, res) => {
  try {
    const { voteType } = req.body;

    if (!["upvote", "downvote"].includes(voteType)) {
      return res.status(400).json({ error: "Invalid vote request" });
    }

    const user = await Users.findById(req.currentUser._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.reputation < 50) {
      return res
        .status(403)
        .json({ error: "You need at least 50 reputation to vote" });
    }

    const post = await Posts.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const postOwner = await Users.findById(post.postedBy);
    if (!postOwner) {
      return res.status(404).json({ error: "Post owner not found" });
    }

    applyVote(post, postOwner, req.currentUser._id, voteType);

    await post.save();
    await postOwner.save();

    await post.populate("postedBy", "displayName");
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new post
router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      communityID,
      title,
      content,
      existingLinkFlairID,
      newLinkFlairContent,
    } = req.body;

    if (!communityID || !title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const community = await Communities.findById(communityID);
    if (!community) {
      return res.status(404).json({ error: "Community not found" });
    }

    let finalLinkFlairID = existingLinkFlairID || undefined;
    const trimmedNewLinkFlairContent = newLinkFlairContent?.trim() || "";

    if (trimmedNewLinkFlairContent.length > 0) {
      const existingFlair = await LinkFlairs.findOne({
        content: {
          $regex: new RegExp(
            `^${escapeRegex(trimmedNewLinkFlairContent)}$`,
            "i",
          ),
        },
      });

      if (existingFlair) {
        finalLinkFlairID = existingFlair._id;
      } else {
        const newFlair = await LinkFlairs.create({
          content: trimmedNewLinkFlairContent,
        });
        finalLinkFlairID = newFlair._id;
      }
    }

    const newPost = await Posts.create({
      title: title.trim(),
      content: content.trim(),
      linkFlairID: finalLinkFlairID,
      postedBy: req.currentUser._id,
    });

    community.postIDs.push(newPost._id);
    await community.save();

    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const {
      communityID,
      title,
      content,
      existingLinkFlairID,
      newLinkFlairContent,
    } = req.body;

    if (!communityID || !title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const post = await Posts.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const isOwner = String(post.postedBy) === String(req.currentUser._id);

    if (!isOwner && !req.currentUser.isAdmin) {
      return res.status(403).json({ error: "Not allowed to edit this post" });
    }

    const newCommunity = await Communities.findById(communityID);

    if (!newCommunity) {
      return res.status(404).json({ error: "Community not found" });
    }

    let finalLinkFlairID = existingLinkFlairID || undefined;
    const trimmedNewLinkFlairContent = newLinkFlairContent?.trim() || "";

    if (trimmedNewLinkFlairContent.length > 0) {
      const existingFlair = await LinkFlairs.findOne({
        content: {
          $regex: new RegExp(
            `^${escapeRegex(trimmedNewLinkFlairContent)}$`,
            "i",
          ),
        },
      });

      if (existingFlair) {
        finalLinkFlairID = existingFlair._id;
      } else {
        const newFlair = await LinkFlairs.create({
          content: trimmedNewLinkFlairContent,
        });
        finalLinkFlairID = newFlair._id;
      }
    }

    await Communities.updateMany(
      { postIDs: post._id },
      { $pull: { postIDs: post._id } },
    );

    newCommunity.postIDs.push(post._id);
    await newCommunity.save();

    post.title = title.trim();
    post.content = content.trim();
    post.linkFlairID = finalLinkFlairID;
    await post.save();

    return res.status(200).json(post);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const isOwner = String(post.postedBy) === String(req.currentUser._id);

    if (!isOwner && !req.currentUser.isAdmin) {
      return res.status(403).json({ error: "Not allowed to delete this post" });
    }

    await deletePostCascade(post._id);
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
