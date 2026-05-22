import { useState } from "react";
import { validateHyperlinks } from "../utils/hyperlinkHelpers.js";

function userIsMemberOfCommunity(user, community) {
  if (!user?._id) {
    return false;
  }

  return (community.members ?? []).some(
    (memberId) => String(memberId) === String(user._id),
  );
}

export default function NewPostPage({
  communities,
  linkFlairs,
  currentUser,
  initialPost,
  initialCommunityID,
  isEditing,
  onSubmitPost,
  onDeletePost,
  onCancel,
}) {
  const [communityID, setCommunityID] = useState(initialCommunityID || "");
  const [title, setTitle] = useState(initialPost?.title || "");
  const [selectedFlairID, setSelectedFlairID] = useState(
    initialPost?.linkFlairID || "",
  );
  const [newFlair, setNewFlair] = useState("");
  const [content, setContent] = useState(initialPost?.content || "");
  const [errors, setErrors] = useState({});

  const sortedCommunities = [...communities].sort((a, b) => {
    const aJoined = userIsMemberOfCommunity(currentUser, a);
    const bJoined = userIsMemberOfCommunity(currentUser, b);

    if (aJoined && !bJoined) {
      return -1;
    }

    if (!aJoined && bJoined) {
      return 1;
    }

    return a.name.localeCompare(b.name);
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedNewFlair = newFlair.trim();
    const trimmedContent = content.trim();

    const nextErrors = {};

    if (communityID.length === 0) {
      nextErrors.communityID = "You must select a community.";
    }

    if (trimmedTitle.length === 0) {
      nextErrors.title = "Post title is required.";
    } else if (trimmedTitle.length > 100) {
      nextErrors.title = "Post title must be 100 characters or fewer.";
    }

    if (selectedFlairID && trimmedNewFlair.length > 0) {
      nextErrors.flair =
        "Choose an existing flair or create a new one, not both.";
    } else if (trimmedNewFlair.length > 30) {
      nextErrors.flair = "New link flair must be 30 characters or fewer.";
    } else if (
      trimmedNewFlair.length > 0 &&
      linkFlairs.some(
        (flair) => flair.content.toLowerCase() === trimmedNewFlair.toLowerCase(),
      )
    ) {
      nextErrors.flair =
        "That flair already exists. Please select it from the dropdown.";
    }

    if (trimmedContent.length === 0) {
      nextErrors.content = "Post content is required.";
    } else {
      const hyperlinkError = validateHyperlinks(trimmedContent);

      if (hyperlinkError) {
        nextErrors.content = hyperlinkError;
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmitPost({
      postID: initialPost?._id || "",
      communityID,
      title: trimmedTitle,
      existingLinkFlairID: selectedFlairID,
      newLinkFlairContent: trimmedNewFlair,
      content: trimmedContent,
    });
  };

  return (
    <form className="formPage" onSubmit={handleSubmit}>
      <h2>{isEditing ? "Edit Post" : "Create Post"}</h2>

      <div className="formField">
        <label htmlFor="postCommunity">
          Community<span className="requiredMark">*</span>
        </label>
        <select
          id="postCommunity"
          value={communityID}
          onChange={(e) => setCommunityID(e.target.value)}>
          <option value="">-- Select a community --</option>
          {sortedCommunities.map((community) => (
            <option key={community._id} value={community._id}>
              {community.name}
            </option>
          ))}
        </select>
        <div className="formError">{errors.communityID || ""}</div>
      </div>

      <div className="formField">
        <label htmlFor="postTitle">
          Title<span className="requiredMark">*</span>
        </label>
        <input
          id="postTitle"
          type="text"
          maxLength="100"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="formError">{errors.title || ""}</div>
      </div>

      <div className="formField">
        <label htmlFor="postFlairSelect">Link Flair optional</label>
        <select
          id="postFlairSelect"
          value={selectedFlairID}
          onChange={(e) => {
            setSelectedFlairID(e.target.value);

            if (e.target.value !== "") {
              setNewFlair("");
            }
          }}>
          <option value="">-- None --</option>
          {linkFlairs.map((flair) => (
            <option key={flair._id} value={flair._id}>
              {flair.content}
            </option>
          ))}
        </select>
      </div>

      <div className="formField">
        <label htmlFor="postFlairNew">Or create a new flair optional</label>
        <input
          id="postFlairNew"
          type="text"
          maxLength="30"
          value={newFlair}
          onChange={(e) => {
            setNewFlair(e.target.value);

            if (e.target.value.trim().length > 0) {
              setSelectedFlairID("");
            }
          }}
        />
        <div className="formError">{errors.flair || ""}</div>
      </div>

      <div className="formField">
        <label htmlFor="postContent">
          Content<span className="requiredMark">*</span>
        </label>
        <textarea
          id="postContent"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="formError">{errors.content || ""}</div>
      </div>

      <button type="submit" className="primaryButton">
        {isEditing ? "Update Post" : "Submit Post"}
      </button>
      {isEditing && (
        <button
          type="button"
          className="secondaryButton"
          style={{ marginLeft: "10px" }}
          onClick={() => {
            if (window.confirm("Delete this post and all of its comments?")) {
              onDeletePost(initialPost._id);
            }
          }}>
          Delete Post
        </button>
      )}
      <button
        type="button"
        className="secondaryButton"
        style={{ marginLeft: "10px" }}
        onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}
