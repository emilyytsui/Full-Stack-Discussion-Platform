process.env.NODE_ENV = "test";
process.env.MONGO_URI = "mongodb://127.0.0.1:27017/phreddit_test_post_creation";

const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const request = require("supertest");
const bcrypt = require("bcrypt");

const { app } = require("../server");
const Users = require("../models/users");
const Communities = require("../models/communities");
const Posts = require("../models/posts");

test.before(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (err) {
    throw new Error(
      `MongoDB must be running at 127.0.0.1:27017 before integration tests. Original error: ${err.message}`,
    );
  }
});

test.after(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
  }

  await mongoose.disconnect();
});

test.beforeEach(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
  }
});

test("POST /posts creates a post and adds its reference to the correct community", async () => {
  const hashedPassword = await bcrypt.hash("SafePassword!123", 10);

  const user = await Users.create({
    firstName: "Post",
    lastName: "Tester",
    email: "posttester@example.com",
    displayName: "posttester",
    password: hashedPassword,
    reputation: 100,
    isAdmin: false,
  });

  const community = await Communities.create({
    name: "Integration Community",
    description: "Community used for integration testing",
    postIDs: [],
    members: [user._id],
    createdBy: user._id,
  });

  const agent = request.agent(app);

  const loginResponse = await agent.post("/users/login").send({
    email: "posttester@example.com",
    password: "SafePassword!123",
  });

  assert.equal(loginResponse.status, 200);

  const createResponse = await agent.post("/posts").send({
    communityID: String(community._id),
    title: "Integration Test Post",
    existingLinkFlairID: "",
    newLinkFlairContent: "",
    content: "This post was created by an integration test.",
    postedBy: String(user._id),
  });

  assert.equal(createResponse.status, 201);
  assert.ok(createResponse.body._id);

  const postInDatabase = await Posts.findById(createResponse.body._id);
  assert.ok(postInDatabase);
  assert.equal(postInDatabase.title, "Integration Test Post");

  const updatedCommunity = await Communities.findById(community._id);
  assert.equal(updatedCommunity.postIDs.length, 1);
  assert.equal(
    String(updatedCommunity.postIDs[0]),
    String(postInDatabase._id),
  );
});
