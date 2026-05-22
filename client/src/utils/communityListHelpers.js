export default function sortCommunities(communities, currentUser) {
  const currentUserId = currentUser?._id ? String(currentUser._id) : null;

  return communities.sort((a, b) => {
    const aIsMember =
      currentUserId &&
      (a.members ?? []).some((memberId) => String(memberId) === currentUserId);

    const bIsMember =
      currentUserId &&
      (b.members ?? []).some((memberId) => String(memberId) === currentUserId);

    if (aIsMember && !bIsMember) return -1;
    if (!aIsMember && bIsMember) return 1;
    return a.name.localeCompare(b.name);
  });
}
