const test = require("node:test");
const assert = require("node:assert/strict");

const { applyVote } = require("../utils/voteHelpers");

test("applyVote adds an upvote and increases owner reputation", () => {
  const post = { upvotes: 0, downvotes: 0, votes: [], votedBy: [] };
  const owner = { reputation: 100 };

  applyVote(post, owner, "user-1", "upvote");

  assert.equal(post.upvotes, 1);
  assert.equal(post.downvotes, 0);
  assert.equal(owner.reputation, 105);
  assert.deepEqual(post.votes, [{ user: "user-1", voteType: "upvote" }]);
  assert.deepEqual(post.votedBy, ["user-1"]);
});

test("applyVote adds a downvote as a positive count and lowers reputation", () => {
  const post = { upvotes: 0, downvotes: 0, votes: [], votedBy: [] };
  const owner = { reputation: 100 };

  applyVote(post, owner, "user-1", "downvote");

  assert.equal(post.upvotes, 0);
  assert.equal(post.downvotes, 1);
  assert.equal(owner.reputation, 90);
});

test("applyVote removes the same vote when clicked again", () => {
  const post = {
    upvotes: 1,
    downvotes: 0,
    votes: [{ user: "user-1", voteType: "upvote" }],
    votedBy: ["user-1"],
  };
  const owner = { reputation: 105 };

  applyVote(post, owner, "user-1", "upvote");

  assert.equal(post.upvotes, 0);
  assert.equal(post.downvotes, 0);
  assert.equal(owner.reputation, 100);
  assert.deepEqual(post.votes, []);
  assert.deepEqual(post.votedBy, []);
});

test("applyVote changes an upvote into a downvote", () => {
  const post = {
    upvotes: 1,
    downvotes: 0,
    votes: [{ user: "user-1", voteType: "upvote" }],
    votedBy: ["user-1"],
  };
  const owner = { reputation: 105 };

  applyVote(post, owner, "user-1", "downvote");

  assert.equal(post.upvotes, 0);
  assert.equal(post.downvotes, 1);
  assert.equal(owner.reputation, 90);
  assert.deepEqual(post.votes, [{ user: "user-1", voteType: "downvote" }]);
  assert.deepEqual(post.votedBy, ["user-1"]);
});

test("applyVote changes a downvote into an upvote", () => {
  const post = {
    upvotes: 0,
    downvotes: 1,
    votes: [{ user: "user-1", voteType: "downvote" }],
    votedBy: ["user-1"],
  };
  const owner = { reputation: 90 };

  applyVote(post, owner, "user-1", "upvote");

  assert.equal(post.upvotes, 1);
  assert.equal(post.downvotes, 0);
  assert.equal(owner.reputation, 105);
  assert.deepEqual(post.votes, [{ user: "user-1", voteType: "upvote" }]);
});
