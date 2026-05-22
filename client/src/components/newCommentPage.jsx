import { useState } from "react";
import { validateHyperlinks } from "../utils/hyperlinkHelpers.js";

export default function NewCommentPage({
  onSubmitComment,
  onDeleteComment,
  onCancel,
  postID,
  parentCommentID,
  initialComment,
  isEditing,
}) {
  const [content, setContent] = useState(initialComment?.content || "");
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedContent = content.trim();
    const nextErrors = {};

    if (trimmedContent.length === 0) {
      nextErrors.content = "Comment content is required.";
    } else if (trimmedContent.length > 500) {
      nextErrors.content = "Comment content must be 500 characters or fewer.";
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

    onSubmitComment({
      commentID: initialComment?._id || "",
      postID,
      parentCommentID,
      content: trimmedContent,
    });
  };

  return (
    <form className="formPage" onSubmit={handleSubmit}>
      <h2>
        {isEditing ? "Edit Comment" : parentCommentID ? "Reply" : "Add a Comment"}
      </h2>

      <div className="formField">
        <label htmlFor="commentContent">
          Comment<span className="requiredMark">*</span>
        </label>
        <textarea
          id="commentContent"
          maxLength="500"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="formError">{errors.content || ""}</div>
      </div>

      <button type="submit" className="primaryButton">
        {isEditing ? "Update Comment" : "Submit Comment"}
      </button>
      {isEditing && (
        <button
          type="button"
          className="secondaryButton"
          style={{ marginLeft: "10px" }}
          onClick={() => {
            if (window.confirm("Delete this comment and all replies?")) {
              onDeleteComment(initialComment._id);
            }
          }}>
          Delete Comment
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
