import { Fragment } from "react";
import { pluralize } from "../utils/formatters.js";
import { postListSplitSections } from "../utils/postListHelpers.js";
import getSearchResults from "../utils/searchPageHelpers.js";
import SortButtons from "./sortButtons.jsx";
import PostCard from "./postCard.jsx";
import thinkingSnoo from "../assets/snoo_thinking.svg";

export default function SearchResultsPage({
  posts,
  comments,
  currentSortType,
  setSortType,
  communities,
  linkFlairs,
  openPostPage,
  userSearchWords,
  currentUser,
}) {
  const filteredPosts = getSearchResults(userSearchWords, posts, comments);

  const { postCount, sortedPosts, combinedPosts } = postListSplitSections({
    posts: filteredPosts,
    comments,
    currentUser,
    currentSortType,
    communities,
  });

  return (
    <div className="searchPage">
      <div className="mainHeader">
        <h2>
          {postCount === 0
            ? `No results found for: "${userSearchWords}"`
            : `Results for: "${userSearchWords}"`}
        </h2>

        {postCount > 0 && (
          <SortButtons
            setSortType={setSortType}
            currentSortType={currentSortType}
          />
        )}
      </div>

      <p id="postCount">{pluralize(postCount, "post")}</p>

      <hr className="divider" />

      <div id="postList" className="postList">
        {postCount > 0 ? (
          <>
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
          </>
        ) : (
          <div className="emptyPostList">
            <img src={thinkingSnoo} className="emptyPostListImage" />
            <p className="emptyPostListText1">
              Hm... we couldn't find any results for {userSearchWords}
            </p>
            <p className="emptyPostListText2">
              Double-check your spelling or try different keywords.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
