import sortCommunities from "../utils/communityListHelpers.js";

export default function NavBar({
  communities,
  setPageView,
  setCurrentCommunityID,
  currentPageView,
  currentCommunityID,
  currentUser,
  onOpenCreateCommunityPage,
}) {
  const sortedCommunities = sortCommunities([...communities], currentUser);

  return (
    <nav id="navBar" className="navBar">
      {/* "Home" link */}
      <a
        href="#"
        className={`home ${
          currentPageView === "home page view" ? "active" : ""
        }`}
        onClick={(e) => {
          e.preventDefault();
          setPageView("home page view");
        }}>
        Home
      </a>

      <hr className="communitiesDivider" />

      {/* Communities header */}
      <h3>Communities</h3>

      {/* "Create Community" button */}
      <button
        id="createCommunityButton"
        className={`createCommunityButton ${
          currentPageView === "new community page view" ? "active" : ""
        }`}
        disabled={!currentUser}
        onClick={(e) => {
          e.preventDefault();
          onOpenCreateCommunityPage();
        }}>
        Create Community
      </button>

      {/* Current communities */}
      <div id="communityList" className="communityList">
        {sortedCommunities.map((community) => (
          <a
            key={community._id}
            href="#"
            className={`communityListLink ${
              currentPageView === "community page view" &&
              currentCommunityID === community._id
                ? "active"
                : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              setCurrentCommunityID(community._id);
              setPageView("community page view");
            }}>
            {community.name}
          </a>
        ))}
      </div>
    </nav>
  );
}
