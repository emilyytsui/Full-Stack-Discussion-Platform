const test = require("node:test");
const assert = require("node:assert/strict");

const Community = require("../models/communities");
const Post = require("../models/posts");
const Comment = require("../models/comments");
const User = require("../models/users");
const {
  deleteCommentCascade,
  deleteCommunityCascade,
  deletePostCascade,
  deleteUserCascade,
} = require("../utils/deleteHelpers");

const originals = {
  Community: {
    find: Community.find,
    findById: Community.findById,
    findByIdAndDelete: Community.findByIdAndDelete,
    updateMany: Community.updateMany,
  },
  Post: {
    find: Post.find,
    findById: Post.findById,
    findByIdAndDelete: Post.findByIdAndDelete,
    updateMany: Post.updateMany,
  },
  Comment: {
    find: Comment.find,
    findById: Comment.findById,
    findByIdAndDelete: Comment.findByIdAndDelete,
    updateMany: Comment.updateMany,
  },
  User: {
    findByIdAndDelete: User.findByIdAndDelete,
    updateMany: User.updateMany,
  },
};

function restoreModelMethods() {
  Community.find = originals.Community.find;
  Community.findById = originals.Community.findById;
  Community.findByIdAndDelete = originals.Community.findByIdAndDelete;
  Community.updateMany = originals.Community.updateMany;
  Post.find = originals.Post.find;
  Post.findById = originals.Post.findById;
  Post.findByIdAndDelete = originals.Post.findByIdAndDelete;
  Post.updateMany = originals.Post.updateMany;
  Comment.find = originals.Comment.find;
  Comment.findById = originals.Comment.findById;
  Comment.findByIdAndDelete = originals.Comment.findByIdAndDelete;
  Comment.updateMany = originals.Comment.updateMany;
  User.findByIdAndDelete = originals.User.findByIdAndDelete;
  User.updateMany = originals.User.updateMany;
}

test.afterEach(() => {
  restoreModelMethods();
});

test("deleteCommentCascade removes nested replies and detaches references", async () => {
  const comments = new Map([
    ["parent-comment", { _id: "parent-comment", commentIDs: ["child-comment"] }],
    ["child-comment", { _id: "child-comment", commentIDs: [] }],
  ]);

  const post = { _id: "post-1", commentIDs: ["parent-comment"] };
  const postUpdateCalls = [];
  const commentUpdateCalls = [];
  const userUpdateCalls = [];

  Comment.findById = async (id) => comments.get(String(id)) || null;
  Comment.findByIdAndDelete = async (id) => comments.delete(String(id));
  Comment.updateMany = async (query, update) => {
    commentUpdateCalls.push({ query, update });

    for (const comment of comments.values()) {
      comment.commentIDs = comment.commentIDs.filter(
        (childID) => String(childID) !== String(update.$pull.commentIDs),
      );
    }
  };

  Post.updateMany = async (query, update) => {
    postUpdateCalls.push({ query, update });
    post.commentIDs = post.commentIDs.filter(
      (commentID) => String(commentID) !== String(update.$pull.commentIDs),
    );
  };

  User.updateMany = async (query, update) => {
    userUpdateCalls.push({ query, update });
  };

  await deleteCommentCascade("parent-comment");

  assert.equal(comments.has("parent-comment"), false);
  assert.equal(comments.has("child-comment"), false);
  assert.deepEqual(post.commentIDs, []);
  assert.equal(postUpdateCalls.length, 2);
  assert.equal(commentUpdateCalls.length, 2);
  assert.equal(userUpdateCalls.length, 2);
});

test("deletePostCascade removes a post, its comments, and community references", async () => {
  const comments = new Map([
    ["parent-comment", { _id: "parent-comment", commentIDs: ["child-comment"] }],
    ["child-comment", { _id: "child-comment", commentIDs: [] }],
  ]);

  const posts = new Map([
    [
      "post-1",
      {
        _id: "post-1",
        commentIDs: ["parent-comment"],
      },
    ],
  ]);

  const communityUpdateCalls = [];
  const userUpdateCalls = [];

  Post.findById = async (id) => posts.get(String(id)) || null;
  Post.findByIdAndDelete = async (id) => posts.delete(String(id));
  Post.updateMany = async () => {};

  Comment.findById = async (id) => comments.get(String(id)) || null;
  Comment.findByIdAndDelete = async (id) => comments.delete(String(id));
  Comment.updateMany = async () => {};

  Community.updateMany = async (query, update) => {
    communityUpdateCalls.push({ query, update });
  };

  User.updateMany = async (query, update) => {
    userUpdateCalls.push({ query, update });
  };

  await deletePostCascade("post-1");

  assert.equal(posts.has("post-1"), false);
  assert.equal(comments.has("parent-comment"), false);
  assert.equal(comments.has("child-comment"), false);
  assert.deepEqual(communityUpdateCalls[0].query, { postIDs: "post-1" });
  assert.deepEqual(communityUpdateCalls[0].update, {
    $pull: { postIDs: "post-1" },
  });
  assert.deepEqual(userUpdateCalls.at(-1).update, {
    $pull: { votedPostIDs: "post-1" },
  });
});

test("deleteCommunityCascade removes every post in the community", async () => {
  const communities = new Map([
    ["community-1", { _id: "community-1", postIDs: ["post-1"] }],
  ]);

  const posts = new Map([
    ["post-1", { _id: "post-1", commentIDs: [] }],
  ]);

  Community.findById = async (id) => communities.get(String(id)) || null;
  Community.findByIdAndDelete = async (id) => communities.delete(String(id));
  Community.updateMany = async () => {};

  Post.findById = async (id) => posts.get(String(id)) || null;
  Post.findByIdAndDelete = async (id) => posts.delete(String(id));

  User.updateMany = async () => {};

  await deleteCommunityCascade("community-1");

  assert.equal(communities.has("community-1"), false);
  assert.equal(posts.has("post-1"), false);
});

test("deleteUserCascade removes owned content and the user account", async () => {
  const ownedCommunity = { _id: "community-1", postIDs: [] };
  const ownedPost = { _id: "post-1", commentIDs: [] };
  const ownedComment = { _id: "comment-1", commentIDs: [] };
  const deletedUsers = [];
  const communityUpdateCalls = [];

  Community.find = async (query) =>
    query.createdBy === "user-1" ? [ownedCommunity] : [];
  Community.findById = async (id) =>
    String(id) === "community-1" ? ownedCommunity : null;
  Community.findByIdAndDelete = async () => {};
  Community.updateMany = async (query, update) => {
    communityUpdateCalls.push({ query, update });
  };

  Post.find = async (query) => (query.postedBy === "user-1" ? [ownedPost] : []);
  Post.findById = async (id) => (String(id) === "post-1" ? ownedPost : null);
  Post.findByIdAndDelete = async () => {};
  Post.updateMany = async () => {};

  Comment.find = async (query) =>
    query.commentedBy === "user-1" ? [ownedComment] : [];
  Comment.findById = async (id) =>
    String(id) === "comment-1" ? ownedComment : null;
  Comment.findByIdAndDelete = async () => {};
  Comment.updateMany = async () => {};

  User.findByIdAndDelete = async (id) => {
    deletedUsers.push(String(id));
  };
  User.updateMany = async () => {};

  await deleteUserCascade("user-1");

  assert.deepEqual(deletedUsers, ["user-1"]);
  assert.deepEqual(communityUpdateCalls.at(-1), {
    query: {},
    update: { $pull: { members: "user-1" } },
  });
});
