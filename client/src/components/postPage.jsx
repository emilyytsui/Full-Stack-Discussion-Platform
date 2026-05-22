import { Fragment } from "react";
import { pluralize, timestampFormatter } from "../utils/formatters.js";
import { getTotalCommentCountFromIDs } from "../utils/postListHelpers.js";
import {
  findCommunityByPostID,
  findLinkFlairByID,
} from "../utils/findHelpers.js";
import FormattedText from "./formattedText.jsx";

function getSortedCommentsByIDs(commentIDs, comments) {
  return commentIDs
    .map((id) => comments.find((comment) => String(comment._id) === String(id)))
    .filter(Boolean)
    .sort((a, b) => b.commentedDate - a.commentedDate);
}

function getDisplayName(userField) {
  if (!userField) {
    return "Unknown User";
  }

  if (typeof userField === "object") {
    return userField.displayName || "Unknown User";
  }

  return userField;
}

function getUserVote(content, currentUser) {
  const vote = (content.votes ?? []).find(
    (item) => String(item.user) === String(currentUser?._id),
  );

  return vote?.voteType || "";
}

function CommentThread({
  commentIDs,
  comments,
  depth,
  openNewCommentPage,
  currentUser,
  onVoteComment,
}) {
  const sortedComments = getSortedCommentsByIDs(commentIDs, comments);
  const canVote = Boolean(currentUser) && (currentUser.reputation ?? 0) >= 50;

  return sortedComments.map((comment) => {
    const currentVote = getUserVote(comment, currentUser);

    return (
      <Fragment key={comment._id}>
      <div className="commentCard" style={{ marginLeft: `${depth * 22}px` }}>
        <div className="commentMeta">
          <span>{getDisplayName(comment.commentedBy)}</span>
          <span>{timestampFormatter(comment.commentedDate)}</span>
        </div>

        <FormattedText
          as="div"
          className="commentContent"
          text={comment.content}
        />

        {currentUser && currentVote && (
          <p className="communityDescription">
            Your vote: {currentVote}. Click it again to remove it.
          </p>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
            marginTop: "8px",
          }}>
          <span className="viewCount">
            {pluralize(comment.upvotes ?? 0, "upvote")}
          </span>
          <span className="commentCount">
            {pluralize(comment.downvotes ?? 0, "downvote")}
          </span>

          {currentUser && (
            <>
              <button
                className={`actionButton ${
                  currentVote === "upvote" ? "activeVoteButton" : ""
                }`}
                disabled={!canVote}
                onClick={() => onVoteComment(comment._id, "upvote")}>
                Upvote
              </button>
              <button
                className={`actionButton ${
                  currentVote === "downvote" ? "activeVoteButton" : ""
                }`}
                disabled={!canVote}
                onClick={() => onVoteComment(comment._id, "downvote")}>
                Downvote
              </button>
            </>
          )}

          <button
            className="actionButton replyButton"
            disabled={!currentUser}
            onClick={() => openNewCommentPage(comment._id)}>
            Reply
          </button>
        </div>
      </div>

      <CommentThread
        commentIDs={comment.commentIDs}
        comments={comments}
        depth={depth + 1}
        openNewCommentPage={openNewCommentPage}
        currentUser={currentUser}
        onVoteComment={onVoteComment}
      />
    </Fragment>
    );
  });
}

export default function PostPage({
  post,
  communities,
  comments,
  linkFlairs,
  openNewCommentPage,
  currentUser,
  onVotePost,
  onVoteComment,
}) {
  if (!post) {
    return <h2>Post not found</h2>;
  }

  const community = findCommunityByPostID(post._id, communities);
  const linkFlair = findLinkFlairByID(post.linkFlairID, linkFlairs);
  const totalComments = getTotalCommentCountFromIDs(post.commentIDs, comments);
  const canVote = Boolean(currentUser) && (currentUser.reputation ?? 0) >= 50;
  const currentVote = getUserVote(post, currentUser);

  return (
    <div className="postPage">
      <div className="postPageHeader">
        <div className="postHeaderTop">
          <span className="communityName">
            {community ? community.name : "Unknown Community"}
          </span>
          <span>{timestampFormatter(post.postedDate)}</span>
        </div>

        <div className="postPostedBy">{getDisplayName(post.postedBy)}</div>

        <div className="postPageTitle">{post.title}</div>

        {linkFlair && <div className="linkFlair">{linkFlair.content}</div>}

        <FormattedText
          as="div"
          className="postBodyContent"
          text={post.content}
        />

        <div className="postHeaderStats">
          <span>{pluralize(post.views ?? 0, "view")}</span>
          <span>{pluralize(totalComments, "comment")}</span>
          <span>{pluralize(post.upvotes ?? 0, "upvote")}</span>
          <span>{pluralize(post.downvotes ?? 0, "downvote")}</span>
        </div>

        {currentUser && (
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "12px",
            }}>
            <button
              className={`actionButton ${
                currentVote === "upvote" ? "activeVoteButton" : ""
              }`}
              disabled={!canVote}
              onClick={() => onVotePost(post._id, "upvote")}>
              Upvote
            </button>
            <button
              className={`actionButton ${
                currentVote === "downvote" ? "activeVoteButton" : ""
              }`}
              disabled={!canVote}
              onClick={() => onVotePost(post._id, "downvote")}>
              Downvote
            </button>
          </div>
        )}

        {currentUser && !canVote && (
          <p className="communityDescription">
            You need at least 50 reputation to vote.
          </p>
        )}

        {currentUser && currentVote && (
          <p className="communityDescription">
            Your vote: {currentVote}. Click it again to remove it.
          </p>
        )}

        <button
          id="addCommentBtn"
          className="actionButton"
          disabled={!currentUser}
          onClick={() => openNewCommentPage("")}>
          Add a comment
        </button>

        <hr className="divider" />
      </div>

      <div className="commentList">
        {post.commentIDs.length === 0 ? (
          <p className="communityDescription">No comments yet.</p>
        ) : (
          <CommentThread
            commentIDs={post.commentIDs}
            comments={comments}
            depth={0}
            openNewCommentPage={openNewCommentPage}
            currentUser={currentUser}
            onVoteComment={onVoteComment}
          />
        )}
      </div>
    </div>
  );
}
