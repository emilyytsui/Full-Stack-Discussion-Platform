process.env.NODE_ENV = "test";
process.env.MONGO_URI = "mongodb://127.0.0.1:27017/phreddit_test_post_deletion";

const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const request = require("supertest");
const bcrypt = require("bcrypt");

const { app } = require("../server");
const Users = require("../models/users");
const Communities = require("../models/communities");
const Posts = require("../models/posts");
const Comments = require("../models/comments");

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

test("DELETE /posts/:id deletes the post and all comments attached to it", async () => {
  const hashedPassword = await bcrypt.hash("SafePassword!123", 10);

  const user = await Users.create({
    firstName: "Delete",
    lastName: "Tester",
    email: "deletetester@example.com",
    displayName: "deletetester",
    password: hashedPassword,
    reputation: 100,
    isAdmin: false,
  });

  const childComment = await Comments.create({
    content: "child comment",
    commentIDs: [],
    commentedBy: user._id,
  });

  const parentComment = await Comments.create({
    content: "parent comment",
    commentIDs: [childComment._id],
    commentedBy: user._id,
  });

  const post = await Posts.create({
    title: "Delete Me",
    content: "This post should be deleted",
    postedBy: user._id,
    commentIDs: [parentComment._id],
    views: 0,
    upvotes: 0,
    downvotes: 0,
  });

  const community = await Communities.create({
    name: "Delete Community",
    description: "Community used for delete test",
    postIDs: [post._id],
    members: [user._id],
    createdBy: user._id,
  });

  const existingPostBeforeDelete = await Posts.findById(post._id);
  assert.ok(existingPostBeforeDelete);

  const agent = request.agent(app);

  const loginResponse = await agent.post("/users/login").send({
    email: "deletetester@example.com",
    password: "SafePassword!123",
  });

  assert.equal(loginResponse.status, 200);

  const deleteResponse = await agent.delete(`/posts/${post._id}`);
  assert.equal(deleteResponse.status, 200);

  const deletedPost = await Posts.findById(post._id);
  assert.equal(deletedPost, null);

  const deletedParentComment = await Comments.findById(parentComment._id);
  const deletedChildComment = await Comments.findById(childComment._id);

  assert.equal(deletedParentComment, null);
  assert.equal(deletedChildComment, null);

  const updatedCommunity = await Communities.findById(community._id);
  assert.equal(updatedCommunity.postIDs.length, 0);
});
