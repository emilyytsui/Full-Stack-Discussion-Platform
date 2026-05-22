import {
  getUserJoinedCommunityPosts,
  getUserNotJoinedCommunityPosts,
} from "./findHelpers.js";

export function getTotalCommentCountFromIDs(commentIDs = [], comments = []) {
  let count = 0;

  function dfs(ids) {
    for (const id of ids ?? []) {
      const comment = comments.find((item) => String(item._id) === String(id));

      if (!comment) {
        continue;
      }

      count += 1;
      dfs(comment.commentIDs);
    }
  }

  dfs(commentIDs);
  return count;
}

export function mostRecentCommentDate(post, comments) {
  if (getTotalCommentCountFromIDs(post.commentIDs, comments) === 0) {
    return -Infinity;
  }

  let latest = post.postedDate;

  function checkComments(commentIDs = []) {
    for (const id of commentIDs) {
      const comment = comments.find((item) => String(item._id) === String(id));

      if (!comment) {
        continue;
      }

      if (comment.commentedDate > latest) {
        latest = comment.commentedDate;
      }

      checkComments(comment.commentIDs);
    }
  }

  checkComments(post.commentIDs);
  return latest;
}

export function sortPosts(posts, comments, sortType = "newest") {
  if (sortType === "newest") {
    posts.sort((a, b) => b.postedDate - a.postedDate);
  } else if (sortType === "oldest") {
    posts.sort((a, b) => a.postedDate - b.postedDate);
  } else if (sortType === "active") {
    posts.sort((a, b) => {
      const aMostRecentCommentDate = mostRecentCommentDate(a, comments);
      const bMostRecentCommentDate = mostRecentCommentDate(b, comments);

      if (
        aMostRecentCommentDate === -Infinity &&
        bMostRecentCommentDate === -Infinity
      ) {
        return b.postedDate - a.postedDate;
      }

      return bMostRecentCommentDate - aMostRecentCommentDate;
    });
  }

  return posts;
}

export function postListSplitSections({
  posts = [],
  comments = [],
  currentSortType = "newest",
  currentUser = null,
  communities = [],
}) {
  const sortedPosts = sortPosts([...posts], comments, currentSortType);

  let sortedUserJoinedCommunityPosts = [];
  let sortedUserNotJoinedCommunityPosts = [];
  let combinedPosts = [];

  if (currentUser?._id) {
    const userJoinedCommunityPosts = getUserJoinedCommunityPosts(
      currentUser._id,
      communities,
      posts,
    );

    const userNotJoinedCommunityPosts = getUserNotJoinedCommunityPosts(
      currentUser._id,
      communities,
      posts,
    );

    sortedUserJoinedCommunityPosts = sortPosts(
      [...userJoinedCommunityPosts],
      comments,
      currentSortType,
    );

    sortedUserNotJoinedCommunityPosts = sortPosts(
      [...userNotJoinedCommunityPosts],
      comments,
      currentSortType,
    );

    const hasTwoSections =
      sortedUserJoinedCommunityPosts.length > 0 &&
      sortedUserNotJoinedCommunityPosts.length > 0;

    combinedPosts = [
      ...sortedUserJoinedCommunityPosts.map((post, index) => ({
        post,
        isLastPost:
          hasTwoSections && index === sortedUserJoinedCommunityPosts.length - 1,
      })),
      ...sortedUserNotJoinedCommunityPosts.map((post) => ({
        post,
        isLastPost: false,
      })),
    ];
  }

  const postCount = currentUser?._id
    ? sortedUserJoinedCommunityPosts.length +
      sortedUserNotJoinedCommunityPosts.length
    : sortedPosts.length;

  return { postCount, sortedPosts, combinedPosts };
}