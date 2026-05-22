const express = require("express");
const router = express.Router();
const Comments = require("../models/comments");
const Posts = require("../models/posts");
const Users = require("../models/users");
const { requireAuth } = require("../middleware/auth");
const { deleteCommentCascade } = require("../utils/deleteHelpers");
const { applyVote } = require("../utils/voteHelpers");

// Get all comments
router.get("/", async (req, res) => {
  try {
    const comments = await Comments.find().populate("commentedBy", "displayName");
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vote on a comment
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

    const comment = await Comments.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const commentOwner = await Users.findById(comment.commentedBy);
    if (!commentOwner) {
      return res.status(404).json({ error: "Comment owner not found" });
    }

    applyVote(comment, commentOwner, req.currentUser._id, voteType);

    await comment.save();
    await commentOwner.save();

    await comment.populate("commentedBy", "displayName");
    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new comment
router.post("/", requireAuth, async (req, res) => {
  try {
    const { postID, parentCommentID, content } = req.body;

    if (!postID || !content?.trim()) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let parentComment = null;
    let post = null;

    if (parentCommentID) {
      parentComment = await Comments.findById(parentCommentID);

      if (!parentComment) {
        return res.status(404).json({ error: "Parent comment not found" });
      }
    } else {
      post = await Posts.findById(postID);

      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
    }

    const newComment = await Comments.create({
      content: content.trim(),
      commentedBy: req.currentUser._id,
    });

    if (parentComment) {
      parentComment.commentIDs.unshift(newComment._id);
      await parentComment.save();
    } else {
      post.commentIDs.unshift(newComment._id);
      await post.save();
    }

    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const comment = await Comments.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const isOwner = String(comment.commentedBy) === String(req.currentUser._id);

    if (!isOwner && !req.currentUser.isAdmin) {
      return res.status(403).json({ error: "Not allowed to edit this comment" });
    }

    comment.content = content.trim();
    await comment.save();

    return res.status(200).json(comment);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const comment = await Comments.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const isOwner = String(comment.commentedBy) === String(req.currentUser._id);

    if (!isOwner && !req.currentUser.isAdmin) {
      return res
        .status(403)
        .json({ error: "Not allowed to delete this comment" });
    }

    await deleteCommentCascade(comment._id);
    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
