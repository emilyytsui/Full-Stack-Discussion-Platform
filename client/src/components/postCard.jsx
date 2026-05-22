import { pluralize, timestampFormatter } from "../utils/formatters.js";
import { getTotalCommentCountFromIDs } from "../utils/postListHelpers.js";
import {
  findCommunityByPostID,
  findLinkFlairByID,
} from "../utils/findHelpers.js";

export default function PostCard({
  post,
  communities,
  comments,
  linkFlairs,
  openPostPage,
  showCommunityName = true,
}) {
  const community = findCommunityByPostID(post._id, communities);
  const linkFlair = findLinkFlairByID(post.linkFlairID, linkFlairs);
  const timeDisplay = timestampFormatter(post.postedDate);
  const commentCount = getTotalCommentCountFromIDs(post.commentIDs, comments);

  return (
    <div className="postCard" onClick={() => openPostPage(post._id)}>
      <div className="postTop">
        {showCommunityName && community && (
          <span className="communityName">{community.name}</span>
        )}
        <span className="author">{post.postedBy?.displayName}</span>
        <span className="time">{timeDisplay}</span>
      </div>

      <div className="postTitle">{post.title}</div>

      {linkFlair && <div className="linkFlair">{linkFlair.content}</div>}

      <div className="postContent">
        {post.content.length > 80
          ? `${post.content.slice(0, 80)}…`
          : post.content}
      </div>

      <div className="postStats">
        <span id="upvoteCount">{pluralize(post.upvotes, "upvote")}</span>
        <span id="downvoteCount">{pluralize(post.downvotes, "downvote")}</span>
        <span className="viewCount">{pluralize(post.views, "view")}</span>
        <span className="commentCount">
          {pluralize(commentCount, "comment")}
        </span>
      </div>
    </div>
  );
}
