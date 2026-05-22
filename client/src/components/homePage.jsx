import { Fragment } from "react";
import { pluralize } from "../utils/formatters.js";
import { postListSplitSections } from "../utils/postListHelpers.js";
import SortButtons from "./sortButtons.jsx";
import PostCard from "./postCard.jsx";

export default function HomePage({
  posts,
  comments,
  currentSortType,
  setSortType,
  communities,
  linkFlairs,
  openPostPage,
  currentUser,
}) {
  const { postCount, sortedPosts, combinedPosts } = postListSplitSections({
    posts,
    comments,
    currentUser,
    currentSortType,
    communities,
  });

  return (
    <div className="homePage">
      <div className="mainHeader">
        <h2>All Posts</h2>
        <SortButtons
          setSortType={setSortType}
          currentSortType={currentSortType}
        />
      </div>

      <p id="postCount">{pluralize(postCount, "post")}</p>

      <hr className="divider" />

      <div id="postList" className="postList">
        {!currentUser &&
          sortedPosts.map((post) => (
            <Fragment key={post._id}>
              <PostCard
                post={post}
                communities={communities}
                comments={comments}
                linkFlairs={linkFlairs}
                openPostPage={openPostPage}
              />
              <hr className="postDivider" />
            </Fragment>
          ))}

        {currentUser &&
          combinedPosts.map(({ post, isLastPost }) => (
            <Fragment key={post._id}>
              <PostCard
                post={post}
                communities={communities}
                comments={comments}
                linkFlairs={linkFlairs}
                openPostPage={openPostPage}
              />
              <hr
                className={`postDivider ${
                  isLastPost ? "postListCommunityDividerSection" : ""
                }`}
              />
            </Fragment>
          ))}
      </div>
    </div>
  );
}
