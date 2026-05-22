export default function Banner({
  setPageView,
  currentPageView,
  setUserSearchWords,
  currentUser,
  onLogout,
  onOpenUserProfile,
  onOpenCreatePostPage,
  bannerError,
}) {
  return (
    <header id="banner" className="banner">
      <div className="bannerMain">
        {/* Application name */}
        <a
          href="#"
          className="applicationName"
          onClick={(e) => {
            e.preventDefault();
            currentUser
              ? setPageView("home page view")
              : setPageView("welcome page view");
          }}>
          phreddit
        </a>

        {/* Search box */}
        <div className="searchBox">
          <input
            type="text"
            id="searchBar"
            placeholder="Search Phreddit..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();

                const userWords = e.target.value.trim();

                if (userWords !== "") {
                  setUserSearchWords(userWords);
                  setPageView("search results page view");
                  e.target.value = "";
                }
              }
            }}
          />
        </div>

        <div className="bannerButtons">
          {/* "Create Post" button */}
          <button
            id="createPostButton"
            className={`createPostButton ${
              currentPageView === "new post page view" ? "active" : ""
            }`}
            disabled={!currentUser}
            onClick={onOpenCreatePostPage}>
            Create Post
          </button>

        <button
          id="userProfileButton"
          className={currentUser ? "userProfileButtonActive" : ""}
          aria-disabled={!currentUser}
          onClick={() => {
            if (currentUser) {
              onOpenUserProfile();
            }
          }}>
          {currentUser ? currentUser.displayName : "Guest"}
        </button>

          {/* "Logout" button */}
          {currentUser && (
            <button id="logoutButton" onClick={onLogout}>
              Log Out
            </button>
          )}
        </div>
      </div>

      {bannerError && (
        <div className="bannerError" role="alert">
          {bannerError}
        </div>
      )}
    </header>
  );
}
