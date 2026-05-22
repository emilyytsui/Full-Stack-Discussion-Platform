const Users = require("../models/users");

async function attachCurrentUser(req, _res, next) {
  req.currentUser = null;

  try {
    if (req.session?.userId) {
      req.currentUser = await Users.findById(req.session.userId, "-password");
    }

    next();
  } catch (err) {
    next(err);
  }
}

function requireUser(req, res, next) {
  if (!req.currentUser) {
    return res.status(401).json({ error: "Authentication required" });
  }

  return next();
}

function requireAdmin(req, res, next) {
  if (!req.currentUser?.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }

  return next();
}

module.exports = {
  attachCurrentUser,
  requireUser,
  requireAuth: requireUser,
  requireAdmin,
};
