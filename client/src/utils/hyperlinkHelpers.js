export function validateHyperlinks(text) {
  const hyperlinkPattern = /\[([^\]]*)\]\(([^)]*)\)/g;
  let match = hyperlinkPattern.exec(text);

  while (match !== null) {
    const linkText = match[1].trim();
    const url = match[2].trim();

    if (linkText.length === 0) {
      return "Hyperlink text inside [] cannot be empty.";
    }

    if (url.length === 0) {
      return "Hyperlink URL inside () cannot be empty.";
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return "Hyperlink URL must start with http:// or https://.";
    }

    match = hyperlinkPattern.exec(text);
  }

  return "";
}

export function tokenizeHyperlinks(text) {
  const hyperlinkPattern = /\[([^\]]*)\]\(([^)]*)\)/g;
  const tokens = [];
  let lastIndex = 0;
  let match = hyperlinkPattern.exec(text);

  while (match !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "text",
        content: text.slice(lastIndex, match.index),
      });
    }

    const linkText = match[1];
    const url = match[2];

    if (
      linkText.trim().length > 0 &&
      url.trim().length > 0 &&
      (url.startsWith("http://") || url.startsWith("https://"))
    ) {
      tokens.push({
        type: "link",
        text: linkText,
        url,
      });
    } else {
      tokens.push({
        type: "text",
        content: match[0],
      });
    }

    lastIndex = hyperlinkPattern.lastIndex;
    match = hyperlinkPattern.exec(text);
  }

  if (lastIndex < text.length) {
    tokens.push({
      type: "text",
      content: text.slice(lastIndex),
    });
  }

  return tokens;
}