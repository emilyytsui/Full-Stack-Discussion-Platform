const test = require("node:test");
const assert = require("node:assert/strict");

const Comment = require("../models/comments");
const Community = require("../models/communities");
const LinkFlair = require("../models/linkflairs");
const Post = require("../models/posts");
const User = require("../models/users");

test("user reputation defaults to 100 for regular users and 1000 for admins", () => {
  const regularUser = new User({
    firstName: "Regular",
    lastName: "User",
    email: "regular@example.com",
    displayName: "regular",
    password: "hashed-password",
  });

  const adminUser = new User({
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    displayName: "admin",
    password: "hashed-password",
    isAdmin: true,
  });

  assert.equal(regularUser.reputation, 100);
  assert.equal(adminUser.reputation, 1000);
});

test("schema URL virtuals expose collection-relative paths", () => {
  const user = new User({
    firstName: "Url",
    lastName: "User",
    email: "urluser@example.com",
    displayName: "urluser",
    password: "hashed-password",
  });

  const post = new Post({
    title: "A post",
    content: "Post content",
    postedBy: user._id,
  });

  const comment = new Comment({
    content: "A comment",
    commentedBy: user._id,
  });

  const community = new Community({
    name: "A community",
    description: "A test community",
    createdBy: user._id,
  });

  const linkFlair = new LinkFlair({
    content: "A flair",
  });

  assert.equal(user.url, `users/${user._id}`);
  assert.equal(post.url, `posts/${post._id}`);
  assert.equal(comment.url, `comments/${comment._id}`);
  assert.equal(community.url, `communities/${community._id}`);
  assert.equal(linkFlair.url, `linkFlairs/${linkFlair._id}`);
});

test("community memberCount reflects current members array", () => {
  const userOne = new User({
    firstName: "One",
    lastName: "User",
    email: "one@example.com",
    displayName: "one",
    password: "hashed-password",
  });

  const userTwo = new User({
    firstName: "Two",
    lastName: "User",
    email: "two@example.com",
    displayName: "two",
    password: "hashed-password",
  });

  const community = new Community({
    name: "Member Count",
    description: "Counts users",
    members: [userOne._id, userTwo._id],
    createdBy: userOne._id,
  });

  assert.equal(community.memberCount, 2);
});
