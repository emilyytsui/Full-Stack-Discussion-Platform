import { Fragment, createElement } from "react";
import { tokenizeHyperlinks } from "../utils/hyperlinkHelpers.js";

function renderTextWithLineBreaks(text, keyPrefix) {
  return text.split("\n").map((line, index) => (
    <Fragment key={`${keyPrefix}-${index}`}>
      {index > 0 && <br />}
      {line}
    </Fragment>
  ));
}

export default function FormattedText({
  text,
  className = "",
  as = "div",
}) {
  const tokens = tokenizeHyperlinks(text);

  const children = tokens.map((token, index) => {
    if (token.type === "link") {
      return (
        <a
          key={`link-${index}`}
          href={token.url}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}>
          {token.text}
        </a>
      );
    }

    return (
      <Fragment key={`text-${index}`}>
        {renderTextWithLineBreaks(token.content, `segment-${index}`)}
      </Fragment>
    );
  });

  return createElement(as, { className }, children);
}