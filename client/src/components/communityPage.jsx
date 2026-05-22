import { Fragment } from "react";
import { pluralize, timestampFormatter } from "../utils/formatters.js";
import { sortPosts } from "../utils/postListHelpers.js";
import SortButtons from "./sortButtons.jsx";
import PostCard from "./postCard.jsx";
import FormattedText from "./formattedText.jsx";

export default function CommunityPage({
  posts,
  comments,
  currentSortType,
  setSortType,
  community,
  linkFlairs,
  openPostPage,
  currentUser,
  onJoinLeaveCommunity,
}) {
  if (!community) {
    return <h2>Community not found</h2>;
  }

  const filteredPosts = posts.filter((post) =>
    (community.postIDs ?? []).some((id) => String(id) === String(post._id)),
  );

  const sortedPosts = sortPosts(filteredPosts, comments, currentSortType);

  const isMember = (community.members ?? []).some(
    (memberId) => String(memberId) === String(currentUser?._id),
  );

  return (
    <div className="communityPage">
      <div className="mainHeader">
        <div className="communityPageHeader">
          <h2>{community.name}</h2>

          {currentUser && (
            <button
              id="joinLeaveCommunityButton"
              onClick={() => onJoinLeaveCommunity(community._id, isMember)}>
              {isMember ? "Leave Community" : "Join Community"}
            </button>
          )}
        </div>

        <SortButtons
          setSortType={setSortType}
          currentSortType={currentSortType}
        />
      </div>

      <FormattedText
        as="div"
        className="communityDescription"
        text={community.description}
      />

      <div className="communityTimestamp">
        Created {timestampFormatter(community.startDate)} by{" "}
        {community.createdBy?.displayName}
      </div>

      <div className="communityPostHeaderBottom">
        <span id="communityPostCount">
          {pluralize(community.postIDs.length, "post")}
        </span>
        <span id="communityMemberCount">
          {pluralize(community.memberCount, "member")}
        </span>
      </div>

      <hr className="divider" />

      <div id="postList" className="postList">
        {sortedPosts.length > 0 ? (
          sortedPosts.map((post) => (
            <Fragment key={post._id}>
              <PostCard
                post={post}
                communities={[community]}
                comments={comments}
                linkFlairs={linkFlairs}
                openPostPage={openPostPage}
                showCommunityName={false}
              />
              <hr className="postDivider" />
            </Fragment>
          ))
        ) : (
          <p className="emptyCommunity">
            This community doesn't have any posts yet.
          </p>
        )}
      </div>
    </div>
  );
}
