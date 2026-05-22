import { useState } from "react";
import { validateHyperlinks } from "../utils/hyperlinkHelpers.js";

export default function NewCommunityPage({
  communities,
  initialCommunity,
  isEditing,
  onSubmitCommunity,
  onDeleteCommunity,
  onCancel,
}) {
  const [name, setName] = useState(initialCommunity?.name || "");
  const [description, setDescription] = useState(
    initialCommunity?.description || "",
  );
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    const nextErrors = {};

    if (trimmedName.length === 0) {
      nextErrors.name = "Community name is required.";
    } else if (trimmedName.length > 100) {
      nextErrors.name = "Community name must be 100 characters or fewer.";
    } else if (
      communities.some(
        (community) =>
          community.name.toLowerCase() === trimmedName.toLowerCase() &&
          String(community._id) !== String(initialCommunity?._id),
      )
    ) {
      nextErrors.name = "A community with this name already exists.";
    }

    if (trimmedDescription.length === 0) {
      nextErrors.description = "Description is required.";
    } else if (trimmedDescription.length > 500) {
      nextErrors.description = "Description must be 500 characters or fewer.";
    } else {
      const hyperlinkError = validateHyperlinks(trimmedDescription);

      if (hyperlinkError) {
        nextErrors.description = hyperlinkError;
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmitCommunity({
      communityID: initialCommunity?._id || "",
      name: trimmedName,
      description: trimmedDescription,
    });
  };

  return (
    <form className="formPage" onSubmit={handleSubmit}>
      <h2>{isEditing ? "Edit Community" : "Create Community"}</h2>

      <div className="formField">
        <label htmlFor="communityName">
          Community Name<span className="requiredMark">*</span>
        </label>
        <input
          id="communityName"
          type="text"
          maxLength="100"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="formError">{errors.name || ""}</div>
      </div>

      <div className="formField">
        <label htmlFor="communityDescription">
          Description<span className="requiredMark">*</span>
        </label>
        <textarea
          id="communityDescription"
          maxLength="500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="formError">{errors.description || ""}</div>
      </div>

      <button type="submit" className="primaryButton">
        {isEditing ? "Update Community" : "Engender Community"}
      </button>
      {isEditing && (
        <button
          type="button"
          className="secondaryButton"
          style={{ marginLeft: "10px" }}
          onClick={() => {
            if (
              window.confirm(
                "Delete this community and all of its posts and comments?",
              )
            ) {
              onDeleteCommunity(initialCommunity._id);
            }
          }}>
          Delete Community
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
