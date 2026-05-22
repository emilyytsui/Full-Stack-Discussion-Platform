const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Users = require("../models/users");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { deleteUserCascade } = require("../utils/deleteHelpers");

const router = express.Router();
const saltRounds = 10;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function serializeUser(user) {
  if (!user) {
    return null;
  }

  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    displayName: user.displayName,
    reputation: user.reputation,
    isAdmin: user.isAdmin,
    memberSince: user.memberSince,
  };
}

// Get all users
router.get("/", async (_req, res) => {
  try {
    const users = await Users.find({}, "-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current session user
router.get("/session", async (req, res) => {
  res.status(200).json({ user: serializeUser(req.currentUser) });
});

// Register a new user
router.post("/", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      displayName,
      password,
      confirmPassword,
    } = req.body;

    const trimmedFirstName = firstName?.trim();
    const trimmedLastName = lastName?.trim();
    const trimmedEmail = email?.trim().toLowerCase();
    const trimmedDisplayName = displayName?.trim();
    const trimmedPassword = password?.trim();
    const trimmedConfirmPassword = confirmPassword?.trim();

    if (
      !trimmedFirstName ||
      !trimmedLastName ||
      !trimmedEmail ||
      !trimmedDisplayName ||
      !trimmedPassword ||
      !trimmedConfirmPassword
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ error: "Email format is invalid" });
    }

    const emailID = trimmedEmail.split("@")[0];

    const existingEmail = await Users.findOne({ email: trimmedEmail });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const existingDisplayName = await Users.findOne({
      displayName: {
        $regex: new RegExp(`^${escapeRegex(trimmedDisplayName)}$`, "i"),
      },
    });
    if (existingDisplayName) {
      return res.status(400).json({ error: "Display name already exists" });
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (trimmedPassword.toLowerCase().includes(trimmedFirstName.toLowerCase())) {
      return res
        .status(400)
        .json({ error: "Password should not contain first name." });
    }

    if (trimmedPassword.toLowerCase().includes(trimmedLastName.toLowerCase())) {
      return res
        .status(400)
        .json({ error: "Password should not contain last name." });
    }

    if (
      trimmedPassword.toLowerCase().includes(trimmedDisplayName.toLowerCase())
    ) {
      return res
        .status(400)
        .json({ error: "Password should not contain display name." });
    }

    if (trimmedPassword.toLowerCase().includes(emailID.toLowerCase())) {
      return res
        .status(400)
        .json({ error: "Password should not contain email id." });
    }

    const hashedPassword = await bcrypt.hash(trimmedPassword, saltRounds);

    const newUser = await Users.create({
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      email: trimmedEmail,
      displayName: trimmedDisplayName,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Register new user successful",
      user: serializeUser(newUser),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const trimmedEmail = email?.trim().toLowerCase();
    const trimmedPassword = password?.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await Users.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(400).json({ error: "Invalid email." });
    }

    const match = await bcrypt.compare(trimmedPassword, user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid password." });
    }

    req.session.userId = String(user._id);

    req.session.save((saveErr) => {
      if (saveErr) {
        return res.status(500).json({ error: saveErr.message });
      }

      return res.status(200).json({
        message: "Login successful",
        user: serializeUser(user),
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout
router.post("/logout", requireAuth, (req, res) => {
  if (!req.session) {
    return res.status(200).json({ message: "Logout successful" });
  }

  const sessionID = req.sessionID;

  req.session.destroy(async (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    try {
      if (sessionID && mongoose.connection.readyState === 1) {
        await mongoose.connection
          .collection("sessions")
          .deleteOne({ _id: sessionID });
      }

      res.clearCookie("connect.sid", {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      });
      return res.status(200).json({ message: "Logout successful" });
    } catch (deleteErr) {
      return res.status(500).json({ error: deleteErr.message });
    }
  });
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const targetUser = await Users.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (targetUser.isAdmin) {
      return res.status(400).json({ error: "Cannot delete an admin user" });
    }

    await deleteUserCascade(targetUser._id);
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
