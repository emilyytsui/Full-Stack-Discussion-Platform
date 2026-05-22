import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./stylesheets/index.css";
import Banner from "./components/banner.jsx";
import NavBar from "./components/navBar.jsx";
import HomePage from "./components/homePage.jsx";
import CommunityPage from "./components/communityPage.jsx";
import SearchResultsPage from "./components/searchResultsPage.jsx";
import PostPage from "./components/postPage.jsx";
import NewCommunityPage from "./components/newCommunityPage.jsx";
import NewPostPage from "./components/newPostPage.jsx";
import NewCommentPage from "./components/newCommentPage.jsx";
import WelcomePage from "./components/welcomePage.jsx";
import RegisterUserPage from "./components/registerUserPage.jsx";
import LoginPage from "./components/loginPage.jsx";
import UserProfilePage from "./components/userProfilePage.jsx";
import { parseDate } from "./utils/formatters.js";

const API_BASE = `${window.location.protocol}//${window.location.hostname}:8000`;
axios.defaults.withCredentials = true;

function getRequestErrorMessage(err, fallbackMessage) {
  if (!err.response) {
    return `${fallbackMessage} Please check that the server is running.`;
  }

  return err.response.data?.error || fallbackMessage;
}

function ErrorNotice({ message, onBackToWelcome }) {
  if (!message) {
    return null;
  }

  return (
    <div className="appErrorNotice" role="alert">
      <div>{message}</div>
      <button type="button" className="secondaryButton" onClick={onBackToWelcome}>
        Back to Welcome Page
      </button>
    </div>
  );
}

function App() {
  const [communities, setCommunities] = useState([]);
  const [posts, setPosts] = useState([]);
  const [linkFlairs, setLinkFlairs] = useState([]);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);

  const [currentCommunityID, setCurrentCommunityID] = useState("");
  const [currentPostID, setCurrentPostID] = useState("");
  const [currentParentCommentID, setCurrentParentCommentID] = useState("");

  const [currentProfileUserID, setCurrentProfileUserID] = useState("");
  const [currentProfileTab, setCurrentProfileTab] = useState("posts");

  const [editingCommunityID, setEditingCommunityID] = useState("");
  const [editingPostID, setEditingPostID] = useState("");
  const [editingCommentID, setEditingCommentID] = useState("");

  const [currentPageView, setPageView] = useState("welcome page view");
  const [userSearchWords, setUserSearchWords] = useState("");
  const [currentSortType, setSortType] = useState("newest");
  const [currentUser, setCurrentUser] = useState(null);
  const [formOrigin, setFormOrigin] = useState("home");
  const [loginError, setLoginError] = useState("");
  const [bannerError, setBannerError] = useState("");
  const [systemError, setSystemError] = useState("");

  const showSystemError = useCallback((err, fallbackMessage) => {
    console.error(err);
    setSystemError(getRequestErrorMessage(err, fallbackMessage));
  }, []);

  const fetchAllData = useCallback(async () => {
    const [
      communitiesResponse,
      postsResponse,
      commentsResponse,
      linkFlairsResponse,
      usersResponse,
    ] = await Promise.all([
      axios.get(`${API_BASE}/communities`),
      axios.get(`${API_BASE}/posts`),
      axios.get(`${API_BASE}/comments`),
      axios.get(`${API_BASE}/linkflairs`),
      axios.get(`${API_BASE}/users`),
    ]);

    setCommunities(parseDate(communitiesResponse.data, "startDate"));
    setPosts(parseDate(postsResponse.data, "postedDate"));
    setComments(parseDate(commentsResponse.data, "commentedDate"));
    setLinkFlairs(linkFlairsResponse.data);
    setUsers(parseDate(usersResponse.data, "memberSince"));
  }, []);

  const fetchSessionUser = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/users/session`);
      const sessionUser = response.data?.user
        ? parseDate([response.data.user], "memberSince")[0]
        : null;

      setCurrentUser(sessionUser);
      return sessionUser;
    } catch (err) {
      console.error(err);
      setCurrentUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sessionUser] = await Promise.all([
          fetchSessionUser(),
          fetchAllData(),
        ]);

        if (sessionUser) {
          setPageView((previousPageView) =>
            previousPageView === "welcome page view"
              ? "home page view"
              : previousPageView,
          );
        }
      } catch (err) {
        showSystemError(err, "Unable to load application data.");
      }
    };

    loadData();
  }, [fetchAllData, fetchSessionUser, showSystemError]);

  const resetEditorState = useCallback(() => {
    setEditingCommunityID("");
    setEditingPostID("");
    setEditingCommentID("");
    setCurrentParentCommentID("");
    setFormOrigin("home");
  }, []);

  const commentTreeContains = useCallback(
    (commentIDs, targetCommentID) => {
      for (const commentID of commentIDs || []) {
        if (String(commentID) === String(targetCommentID)) {
          return true;
        }

        const currentComment = comments.find(
          (comment) => String(comment._id) === String(commentID),
        );

        if (
          currentComment &&
          commentTreeContains(currentComment.commentIDs || [], targetCommentID)
        ) {
          return true;
        }
      }

      return false;
    },
    [comments],
  );

  const findOwningPostByCommentID = useCallback(
    (commentID) =>
      posts.find((post) =>
        commentTreeContains(post.commentIDs || [], commentID),
      ),
    [posts, commentTreeContains],
  );

  const findOwningCommunityByPostID = useCallback(
    (postID) =>
      communities.find((community) =>
        (community.postIDs ?? []).some((id) => String(id) === String(postID)),
      ),
    [communities],
  );

  const handlePageViewChange = (newPageView) => {
    setLoginError("");
    setBannerError("");
    setSystemError("");
    setPageView(newPageView);

    if (
      newPageView === "home page view" ||
      newPageView === "community page view" ||
      newPageView === "search results page view"
    ) {
      setSortType("newest");
    }
  };

  const openCreateCommunityPage = () => {
    setSystemError("");
    resetEditorState();
    setFormOrigin("home");
    setPageView("new community page view");
  };

  const openCreatePostPage = () => {
    setSystemError("");
    resetEditorState();
    setFormOrigin("home");
    setPageView("new post page view");
  };

  const openUserProfile = (userID = currentUser?._id, defaultTab) => {
    if (!currentUser || !userID) {
      return;
    }

    setSystemError("");
    const isAdminViewingSelf =
      currentUser.isAdmin && String(currentUser._id) === String(userID);

    setCurrentProfileUserID(userID);
    setCurrentProfileTab(defaultTab || (isAdminViewingSelf ? "users" : "posts"));
    setPageView("user profile page view");
  };

  const openEditCommunityPage = (communityID) => {
    setSystemError("");
    setEditingCommunityID(communityID);
    setEditingPostID("");
    setEditingCommentID("");
    setCurrentParentCommentID("");
    setFormOrigin("profile");
    setPageView("new community page view");
  };

  const openEditPostPage = (postID) => {
    setSystemError("");
    setEditingPostID(postID);
    setEditingCommunityID("");
    setEditingCommentID("");
    setCurrentParentCommentID("");
    setFormOrigin("profile");
    setPageView("new post page view");
  };

  const openEditCommentPage = (commentID) => {
    const owningPost = findOwningPostByCommentID(commentID);

    if (owningPost) {
      setCurrentPostID(owningPost._id);
    }

    setSystemError("");
    setEditingCommentID(commentID);
    setEditingCommunityID("");
    setEditingPostID("");
    setCurrentParentCommentID("");
    setFormOrigin("profile");
    setPageView("new comment page view");
  };

  const openPostPage = async (postID) => {
    try {
      setSystemError("");
      const response = await axios.patch(`${API_BASE}/posts/${postID}/views`);
      const updatedPost = parseDate([response.data], "postedDate")[0];

      setPosts((previousPosts) =>
        previousPosts.map((post) =>
          String(post._id) === String(updatedPost._id) ? updatedPost : post,
        ),
      );
    } catch (err) {
      showSystemError(err, "Unable to open the post page.");
      return;
    }

    setCurrentPostID(postID);
    setCurrentParentCommentID("");
    setEditingCommentID("");
    setPageView("post page view");
  };

  const openNewCommentPage = (parentCommentID = "") => {
    setSystemError("");
    setEditingCommentID("");
    setCurrentParentCommentID(parentCommentID);
    setFormOrigin("post");
    setPageView("new comment page view");
  };

  const cancelForm = (fallbackPageView) => {
    setSystemError("");
    const nextPageView =
      formOrigin === "profile" ? "user profile page view" : fallbackPageView;
    resetEditorState();
    setPageView(nextPageView);
  };

  const handleSubmitCommunity = async ({ communityID, name, description }) => {
    try {
      setSystemError("");
      if (communityID) {
        await axios.put(`${API_BASE}/communities/${communityID}`, {
          name,
          description,
        });

        await fetchAllData();
        resetEditorState();
        setPageView("user profile page view");
        return;
      }

      const response = await axios.post(`${API_BASE}/communities`, {
        name,
        description,
      });

      await fetchAllData();
      resetEditorState();
      setCurrentCommunityID(response.data._id);
      setPageView("community page view");
    } catch (err) {
      showSystemError(err, "Unable to save the community.");
    }
  };

  const handleDeleteCommunity = async (communityID, deleteOrigin = formOrigin) => {
    try {
      setSystemError("");
      await axios.delete(`${API_BASE}/communities/${communityID}`);
      await fetchAllData();
      resetEditorState();
      setPageView(deleteOrigin === "profile" ? "user profile page view" : "home page view");
    } catch (err) {
      showSystemError(err, "Unable to delete the community.");
    }
  };

  const handleSubmitPost = async ({
    postID,
    communityID,
    title,
    existingLinkFlairID,
    newLinkFlairContent,
    content,
  }) => {
    try {
      setSystemError("");
      if (postID) {
        await axios.put(`${API_BASE}/posts/${postID}`, {
          communityID,
          title,
          existingLinkFlairID,
          newLinkFlairContent,
          content,
        });

        await fetchAllData();
        resetEditorState();
        setPageView("user profile page view");
        return;
      }

      await axios.post(`${API_BASE}/posts`, {
        communityID,
        title,
        existingLinkFlairID,
        newLinkFlairContent,
        content,
      });

      await fetchAllData();
      resetEditorState();
      setPageView("home page view");
      setSortType("newest");
    } catch (err) {
      showSystemError(err, "Unable to save the post.");
    }
  };

  const handleDeletePost = async (postID, deleteOrigin = formOrigin) => {
    try {
      setSystemError("");
      await axios.delete(`${API_BASE}/posts/${postID}`);
      await fetchAllData();
      resetEditorState();
      setPageView(deleteOrigin === "profile" ? "user profile page view" : "home page view");
    } catch (err) {
      showSystemError(err, "Unable to delete the post.");
    }
  };

  const handleSubmitComment = async ({
    commentID,
    postID,
    parentCommentID,
    content,
  }) => {
    try {
      setSystemError("");
      if (commentID) {
        await axios.put(`${API_BASE}/comments/${commentID}`, {
          content,
        });

        await fetchAllData();
        resetEditorState();
        setPageView("user profile page view");
        return;
      }

      await axios.post(`${API_BASE}/comments`, {
        postID,
        parentCommentID,
        content,
      });

      await fetchAllData();
      resetEditorState();
      setCurrentPostID(postID);
      setPageView("post page view");
    } catch (err) {
      showSystemError(err, "Unable to save the comment.");
    }
  };

  const handleDeleteComment = async (commentID, deleteOrigin = formOrigin) => {
    try {
      setSystemError("");
      await axios.delete(`${API_BASE}/comments/${commentID}`);
      await fetchAllData();
      resetEditorState();
      setPageView(deleteOrigin === "profile" ? "user profile page view" : "post page view");
    } catch (err) {
      showSystemError(err, "Unable to delete the comment.");
    }
  };

  const handleCreateUser = async (
    firstName,
    lastName,
    email,
    displayName,
    password,
    confirmPassword,
  ) => {
    try {
      setSystemError("");
      await axios.post(`${API_BASE}/users`, {
        firstName,
        lastName,
        email,
        displayName,
        password,
        confirmPassword,
      });

      await fetchAllData();
      setPageView("welcome page view");
    } catch (err) {
      showSystemError(err, "Unable to create the account.");
    }
  };

  const handleLogin = async (email, password) => {
    try {
      setLoginError("");
      setSystemError("");
      const response = await axios.post(`${API_BASE}/users/login`, {
        email,
        password,
      });

      const loggedInUser = response.data?.user
        ? parseDate([response.data.user], "memberSince")[0]
        : null;

      if (!loggedInUser) {
        setLoginError("Login failed.");
        return;
      }

      setCurrentUser(loggedInUser);
      await fetchAllData();
      setPageView("home page view");
    } catch (err) {
      console.error(err);
      setLoginError(err.response?.data?.error || "Login failed.");
      if (!err.response) {
        setSystemError(getRequestErrorMessage(err, "Unable to log in."));
      }
    }
  };

  const handleLogout = async () => {
    try {
      setBannerError("");
      setSystemError("");
      await axios.post(`${API_BASE}/users/logout`);
      setCurrentUser(null);
      setCurrentProfileUserID("");
      setCurrentProfileTab("posts");
      resetEditorState();
      setPageView("welcome page view");
    } catch (err) {
      console.error(err);
      setSystemError(getRequestErrorMessage(err, "Log out failed."));
    }
  };

  const handleJoinLeaveCommunity = async (communityId, isMember) => {
    try {
      setSystemError("");
      if (!currentUser?._id) {
        return;
      }

      const route = isMember ? "leave" : "join";
      await axios.patch(`${API_BASE}/communities/${communityId}/${route}`);
      await fetchAllData();
    } catch (err) {
      showSystemError(err, "Unable to update community membership.");
    }
  };

  const handleVotePost = async (postId, voteType) => {
    try {
      setSystemError("");
      await axios.patch(`${API_BASE}/posts/${postId}/vote`, {
        voteType,
      });

      await Promise.all([fetchAllData(), fetchSessionUser()]);
    } catch (err) {
      showSystemError(err, "Voting on the post failed.");
    }
  };

  const handleVoteComment = async (commentId, voteType) => {
    try {
      setSystemError("");
      await axios.patch(`${API_BASE}/comments/${commentId}/vote`, {
        voteType,
      });

      await Promise.all([fetchAllData(), fetchSessionUser()]);
    } catch (err) {
      showSystemError(err, "Voting on the comment failed.");
    }
  };

  const handleDeleteUser = async (userID) => {
    try {
      setSystemError("");
      await axios.delete(`${API_BASE}/users/${userID}`);
      const sessionUser = await fetchSessionUser();
      await fetchAllData();

      if (sessionUser) {
        setCurrentProfileUserID(sessionUser._id);
        setCurrentProfileTab(sessionUser.isAdmin ? "users" : "posts");
        setPageView("user profile page view");
      } else {
        setPageView("welcome page view");
      }
    } catch (err) {
      showSystemError(err, "Unable to delete the user.");
    }
  };

  const backToWelcomePage = () => {
    setSystemError("");
    setBannerError("");
    setLoginError("");
    setCurrentUser(null);
    setCurrentCommunityID("");
    setCurrentPostID("");
    setCurrentParentCommentID("");
    setCurrentProfileUserID("");
    setCurrentProfileTab("posts");
    resetEditorState();
    setPageView("welcome page view");
  };

  const showBannerNavBar = ![
    "welcome page view",
    "register user page view",
    "login page view",
  ].includes(currentPageView);

  const renderMainContent = () => {
    switch (currentPageView) {
      case "home page view":
        return (
          <HomePage
            posts={posts}
            comments={comments}
            communities={communities}
            linkFlairs={linkFlairs}
            currentSortType={currentSortType}
            setSortType={setSortType}
            openPostPage={openPostPage}
            currentUser={currentUser}
          />
        );

      case "community page view": {
        const community = communities.find(
          (item) => String(item._id) === String(currentCommunityID),
        );

        return (
          <CommunityPage
            posts={posts}
            comments={comments}
            community={community}
            linkFlairs={linkFlairs}
            currentSortType={currentSortType}
            setSortType={setSortType}
            openPostPage={openPostPage}
            currentUser={currentUser}
            onJoinLeaveCommunity={handleJoinLeaveCommunity}
          />
        );
      }

      case "search results page view":
        return (
          <SearchResultsPage
            posts={posts}
            comments={comments}
            communities={communities}
            linkFlairs={linkFlairs}
            currentSortType={currentSortType}
            setSortType={setSortType}
            openPostPage={openPostPage}
            userSearchWords={userSearchWords}
            currentUser={currentUser}
          />
        );

      case "post page view": {
        const post = posts.find((item) => String(item._id) === String(currentPostID));

        return (
          <PostPage
            post={post}
            communities={communities}
            comments={comments}
            linkFlairs={linkFlairs}
            openNewCommentPage={openNewCommentPage}
            currentUser={currentUser}
            onVotePost={handleVotePost}
            onVoteComment={handleVoteComment}
          />
        );
      }

      case "new community page view": {
        const initialCommunity = communities.find(
          (community) => String(community._id) === String(editingCommunityID),
        );

        return (
          <NewCommunityPage
            key={initialCommunity?._id || "new-community"}
            communities={communities}
            initialCommunity={initialCommunity || null}
            isEditing={Boolean(initialCommunity)}
            onSubmitCommunity={handleSubmitCommunity}
            onDeleteCommunity={handleDeleteCommunity}
            onCancel={() => cancelForm("home page view")}
          />
        );
      }

      case "new post page view": {
        const initialPost = posts.find(
          (post) => String(post._id) === String(editingPostID),
        );

        const initialCommunity = initialPost
          ? findOwningCommunityByPostID(initialPost._id)
          : null;

        return (
          <NewPostPage
            key={initialPost?._id || "new-post"}
            communities={communities}
            linkFlairs={linkFlairs}
            currentUser={currentUser}
            initialPost={initialPost || null}
            initialCommunityID={initialCommunity?._id || ""}
            isEditing={Boolean(initialPost)}
            onSubmitPost={handleSubmitPost}
            onDeletePost={handleDeletePost}
            onCancel={() => cancelForm("home page view")}
          />
        );
      }

      case "new comment page view": {
        const initialComment = comments.find(
          (comment) => String(comment._id) === String(editingCommentID),
        );

        return (
          <NewCommentPage
            key={initialComment?._id || currentParentCommentID || "new-comment"}
            postID={currentPostID}
            parentCommentID={currentParentCommentID}
            initialComment={initialComment || null}
            isEditing={Boolean(initialComment)}
            onSubmitComment={handleSubmitComment}
            onDeleteComment={handleDeleteComment}
            onCancel={() => cancelForm("post page view")}
          />
        );
      }

      case "user profile page view": {
        const profileUser =
          users.find((user) => String(user._id) === String(currentProfileUserID)) ||
          currentUser;

        return (
          <UserProfilePage
            currentUser={currentUser}
            profileUser={profileUser}
            users={users}
            communities={communities}
            posts={posts}
            comments={comments}
            currentTab={currentProfileTab}
            setCurrentTab={setCurrentProfileTab}
            onOpenUserProfile={openUserProfile}
            onEditCommunity={openEditCommunityPage}
            onDeleteCommunity={(communityID) =>
              handleDeleteCommunity(communityID, "profile")
            }
            onEditPost={openEditPostPage}
            onDeletePost={(postID) => handleDeletePost(postID, "profile")}
            onEditComment={openEditCommentPage}
            onDeleteComment={(commentID) =>
              handleDeleteComment(commentID, "profile")
            }
            onDeleteUser={handleDeleteUser}
          />
        );
      }

      case "welcome page view":
        return <WelcomePage setPageView={handlePageViewChange} />;

      case "register user page view":
        return <RegisterUserPage users={users} onCreateUser={handleCreateUser} />;

      case "login page view":
        return <LoginPage onLogin={handleLogin} serverError={loginError} />;

      default:
        return <h2>Main Content</h2>;
    }
  };

  return !showBannerNavBar ? (
    <>
      <ErrorNotice message={systemError} onBackToWelcome={backToWelcomePage} />
      {renderMainContent()}
    </>
  ) : (
    <>
      <Banner
        setPageView={handlePageViewChange}
        currentPageView={currentPageView}
        setUserSearchWords={setUserSearchWords}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenUserProfile={openUserProfile}
        onOpenCreatePostPage={openCreatePostPage}
        bannerError={bannerError}
      />

      <div className="container">
        <NavBar
          communities={communities}
          setPageView={handlePageViewChange}
          setCurrentCommunityID={setCurrentCommunityID}
          currentPageView={currentPageView}
          currentCommunityID={currentCommunityID}
          currentUser={currentUser}
          onOpenCreateCommunityPage={openCreateCommunityPage}
        />

        <div id="main" className="main">
          <ErrorNotice
            message={systemError}
            onBackToWelcome={backToWelcomePage}
          />
          {renderMainContent()}
        </div>
      </div>
    </>
  );
}

export default App;
