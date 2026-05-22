import { timestampFormatter } from "../utils/formatters.js";

function getUserID(userField) {
  if (!userField) {
    return "";
  }

  if (typeof userField === "object") {
    return String(userField._id || "");
  }

  return String(userField);
}

function getShortCommentPreview(content) {
  const trimmedContent = content.trim();

  if (trimmedContent.length <= 20) {
    return trimmedContent;
  }

  return `${trimmedContent.slice(0, 20)}...`;
}

function commentTreeContains(commentIDs, targetCommentID, comments) {
  for (const commentID of commentIDs || []) {
    if (String(commentID) === String(targetCommentID)) {
      return true;
    }

    const comment = comments.find(
      (item) => String(item._id) === String(commentID),
    );

    if (comment && commentTreeContains(comment.commentIDs, targetCommentID, comments)) {
      return true;
    }
  }

  return false;
}

function findPostForComment(commentID, posts, comments) {
  return posts.find((post) =>
    commentTreeContains(post.commentIDs || [], commentID, comments),
  );
}

export default function UserProfilePage({
  currentUser,
  profileUser,
  users,
  communities,
  posts,
  comments,
  currentTab,
  setCurrentTab,
  onOpenUserProfile,
  onEditCommunity,
  onDeleteCommunity,
  onEditPost,
  onDeletePost,
  onEditComment,
  onDeleteComment,
  onDeleteUser,
}) {
  if (!profileUser) {
    return <h2>User profile not found</h2>;
  }

  const isAdminViewingSelf =
    currentUser?.isAdmin && String(currentUser._id) === String(profileUser._id);

  const profileUserID = String(profileUser._id);

  const ownedCommunities = communities.filter(
    (community) => getUserID(community.createdBy) === profileUserID,
  );

  const ownedPosts = posts.filter(
    (post) => getUserID(post.postedBy) === profileUserID,
  );

  const ownedComments = comments.filter(
    (comment) => getUserID(comment.commentedBy) === profileUserID,
  );

  const tabOptions = isAdminViewingSelf
    ? ["users", "communities", "posts", "comments"]
    : ["communities", "posts", "comments"];

  const activeTab = tabOptions.includes(currentTab) ? currentTab : tabOptions[0];
  const nonAdminUsers = users.filter((user) => !user.isAdmin);

  return (
    <section className="userProfilePage">
      <header className="profileHeader">
        <h2>{profileUser.displayName}</h2>
        <div className="profileMeta">
          <span>Email: {profileUser.email}</span>
          <span>Member since: {timestampFormatter(profileUser.memberSince)}</span>
          <span>Reputation: {profileUser.reputation}</span>
        </div>
      </header>

      {!isAdminViewingSelf && currentUser?.isAdmin && (
        <button
          type="button"
          className="secondaryButton"
          onClick={() => onOpenUserProfile(currentUser._id, "users")}>
          Back to Admin Profile
        </button>
      )}

      <div className="profileTabs">
        {tabOptions.map((tabName) => (
          <button
            key={tabName}
            type="button"
            className={`profileTab ${activeTab === tabName ? "active" : ""}`}
            onClick={() => setCurrentTab(tabName)}>
            {tabName === "users" ? "Non-Admin Users" : tabName}
          </button>
        ))}
      </div>

      {activeTab === "users" && (
        <div className="profileList">
          {nonAdminUsers.length === 0 ? (
            <p>No non-admin users.</p>
          ) : (
            nonAdminUsers.map((user) => (
              <div className="profileListRow" key={user._id}>
                <button
                  type="button"
                  className="profileLink"
                  onClick={() => onOpenUserProfile(user._id, "posts")}>
                  {user.displayName} - {user.email} - reputation{" "}
                  {user.reputation}
                </button>
                <button
                  type="button"
                  className="dangerButton"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Delete this user and all of their content?",
                      )
                    ) {
                      onDeleteUser(user._id);
                    }
                  }}>
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "communities" && (
        <div className="profileList">
          {ownedCommunities.length === 0 ? (
            <p>No communities created by this user.</p>
          ) : (
            ownedCommunities.map((community) => (
              <div className="profileListRow" key={community._id}>
                <button
                  type="button"
                  className="profileLink"
                  onClick={() => onEditCommunity(community._id)}>
                  {community.name}
                </button>
                <button
                  type="button"
                  className="dangerButton"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Delete this community and all of its posts and comments?",
                      )
                    ) {
                      onDeleteCommunity(community._id);
                    }
                  }}>
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "posts" && (
        <div className="profileList">
          {ownedPosts.length === 0 ? (
            <p>No posts created by this user.</p>
          ) : (
            ownedPosts.map((post) => (
              <div className="profileListRow" key={post._id}>
                <button
                  type="button"
                  className="profileLink"
                  onClick={() => onEditPost(post._id)}>
                  {post.title}
                </button>
                <button
                  type="button"
                  className="dangerButton"
                  onClick={() => {
                    if (window.confirm("Delete this post and all comments?")) {
                      onDeletePost(post._id);
                    }
                  }}>
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "comments" && (
        <div className="profileList">
          {ownedComments.length === 0 ? (
            <p>No comments created by this user.</p>
          ) : (
            ownedComments.map((comment) => {
              const post = findPostForComment(comment._id, posts, comments);
              const postTitle = post?.title || "Deleted post";

              return (
                <div className="profileListRow" key={comment._id}>
                  <button
                    type="button"
                    className="profileLink"
                    onClick={() => onEditComment(comment._id)}>
                    {postTitle}: {getShortCommentPreview(comment.content)}
                  </button>
                  <button
                    type="button"
                    className="dangerButton"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Delete this comment and all replies?",
                        )
                      ) {
                        onDeleteComment(comment._id);
                      }
                    }}>
                    Delete
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
}
