export function findCommunityByPostID(postID, communities) {
  return communities.find((c) =>
    (c.postIDs ?? []).some((id) => String(id) === String(postID)),
  );
}

export function findLinkFlairByID(linkFlairID, linkFlairs) {
  return linkFlairs.find((f) => String(f._id) === String(linkFlairID));
}

export function findCommunitiesUserJoined(userID, communities) {
  const uid = String(userID);
  return communities.filter((c) =>
    (c.members ?? []).some((memberId) => String(memberId) === uid),
  );
}

export function findCommunitiesUserNotJoined(userID, communities) {
  const uid = String(userID);
  return communities.filter(
    (c) => !(c.members ?? []).some((memberId) => String(memberId) === uid),
  );
}

export function findPostsByCommunities(communities, posts) {
  const postIDSet = new Set(
    communities.flatMap((c) => (c.postIDs || []).map((id) => String(id))),
  );
  return posts.filter((p) => postIDSet.has(String(p._id)));
}

export function getUserJoinedCommunityPosts(userID, communities, posts) {
  return findPostsByCommunities(
    findCommunitiesUserJoined(userID, communities),
    posts,
  );
}

export function getUserNotJoinedCommunityPosts(userID, communities, posts) {
  return findPostsByCommunities(
    findCommunitiesUserNotJoined(userID, communities),
    posts,
  );
}
