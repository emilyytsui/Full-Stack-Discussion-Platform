const test = require("node:test");
const assert = require("node:assert/strict");

const Users = require("../models/users");
const {
  attachCurrentUser,
  requireAuth,
  requireAdmin,
} = require("../middleware/auth");

const originalFindById = Users.findById;

test.after(() => {
  Users.findById = originalFindById;
});

test("attachCurrentUser leaves req.currentUser as null when there is no session user", async () => {
  const req = { session: {} };
  const res = {};
  let nextCalled = false;

  await attachCurrentUser(req, res, () => {
    nextCalled = true;
  });

  assert.equal(req.currentUser, null);
  assert.equal(nextCalled, true);
});

test("attachCurrentUser loads the logged-in user from the session", async () => {
  const fakeUser = { _id: "abc123", displayName: "tester" };

  Users.findById = async (id) => {
    assert.equal(id, "abc123");
    return fakeUser;
  };

  const req = { session: { userId: "abc123" } };
  const res = {};
  let nextCalled = false;

  await attachCurrentUser(req, res, () => {
    nextCalled = true;
  });

  assert.deepEqual(req.currentUser, fakeUser);
  assert.equal(nextCalled, true);

  Users.findById = originalFindById;
});

test("requireAuth blocks unauthenticated users", () => {
  const req = { currentUser: null };

  let statusCode = null;
  let jsonPayload = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      jsonPayload = payload;
      return this;
    },
  };

  let nextCalled = false;

  requireAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(statusCode, 401);
  assert.deepEqual(jsonPayload, { error: "Authentication required" });
  assert.equal(nextCalled, false);
});

test("requireAuth allows authenticated users", () => {
  const req = { currentUser: { _id: "u1" } };
  const res = {};

  let nextCalled = false;

  requireAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
});

test("requireAdmin blocks non-admin users", () => {
  const req = { currentUser: { _id: "u1", isAdmin: false } };

  let statusCode = null;
  let jsonPayload = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      jsonPayload = payload;
      return this;
    },
  };

  let nextCalled = false;

  requireAdmin(req, res, () => {
    nextCalled = true;
  });

  assert.equal(statusCode, 403);
  assert.deepEqual(jsonPayload, { error: "Admin access required" });
  assert.equal(nextCalled, false);
});

test("requireAdmin allows admin users", () => {
  const req = { currentUser: { _id: "u1", isAdmin: true } };
  const res = {};

  let nextCalled = false;

  requireAdmin(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
});