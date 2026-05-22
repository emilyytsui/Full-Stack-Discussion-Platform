export default function getSearchResults(userSearchWords, posts, comments) {
  const searchTerms = userSearchWords
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (searchTerms.length === 0) {
    return [];
  }

  const termSet = new Set(searchTerms);
  const results = [];

  function textHasAnyTerm(text = "") {
    const words = text.toLowerCase().match(/\b[\w']+\b/g) || [];

    for (const word of words) {
      if (termSet.has(word)) {
        return true;
      }
    }

    return false;
  }

  function checkComments(commentIDs = []) {
    for (const id of commentIDs) {
      const comment = comments.find((item) => String(item._id) === String(id));

      if (!comment) {
        continue;
      }

      if (textHasAnyTerm(comment.content)) {
        return true;
      }

      if (checkComments(comment.commentIDs)) {
        return true;
      }
    }

    return false;
  }

  for (const post of posts) {
    if (
      textHasAnyTerm(post.title) ||
      textHasAnyTerm(post.content) ||
      checkComments(post.commentIDs)
    ) {
      results.push(post);
    }
  }

  return results;
}