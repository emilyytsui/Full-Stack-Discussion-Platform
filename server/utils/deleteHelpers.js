const Communities = require("../models/communities");
const Posts = require("../models/posts");
const Comments = require("../models/comments");
const Users = require("../models/users");

async function detachCommentReferences(commentID) {
  await Posts.updateMany(
    { commentIDs: commentID },
    { $pull: { commentIDs: commentID } },
  );

  await Comments.updateMany(
    { commentIDs: commentID },
    { $pull: { commentIDs: commentID } },
  );
}

async function deleteCommentCascade(commentID) {
  const comment = await Comments.findById(commentID);

  if (!comment) {
    return;
  }

  await detachCommentReferences(comment._id);

  for (const childCommentID of comment.commentIDs || []) {
    await deleteCommentCascade(childCommentID);
  }

  await Comments.findByIdAndDelete(comment._id);
  await Users.updateMany({}, { $pull: { votedCommentIDs: comment._id } });
}

async function deletePostCascade(postID) {
  const post = await Posts.findById(postID);

  if (!post) {
    return;
  }

  for (const commentID of post.commentIDs || []) {
    await deleteCommentCascade(commentID);
  }

  await Communities.updateMany(
    { postIDs: post._id },
    { $pull: { postIDs: post._id } },
  );

  await Posts.findByIdAndDelete(post._id);
  await Users.updateMany({}, { $pull: { votedPostIDs: post._id } });
}

async function deleteCommunityCascade(communityID) {
  const community = await Communities.findById(communityID);

  if (!community) {
    return;
  }

  for (const postID of community.postIDs || []) {
    await deletePostCascade(postID);
  }

  await Communities.findByIdAndDelete(community._id);
}

async function deleteUserCascade(userID) {
  const ownedCommunities = await Communities.find({ createdBy: userID });

  for (const community of ownedCommunities) {
    await deleteCommunityCascade(community._id);
  }

  const ownedPosts = await Posts.find({ postedBy: userID });

  for (const post of ownedPosts) {
    await deletePostCascade(post._id);
  }

  const ownedComments = await Comments.find({ commentedBy: userID });

  for (const comment of ownedComments) {
    await deleteCommentCascade(comment._id);
  }

  await Communities.updateMany({}, { $pull: { members: userID } });
  await Users.findByIdAndDelete(userID);
}

module.exports = {
  deleteCommentCascade,
  deletePostCascade,
  deleteCommunityCascade,
  deleteUserCascade,
};