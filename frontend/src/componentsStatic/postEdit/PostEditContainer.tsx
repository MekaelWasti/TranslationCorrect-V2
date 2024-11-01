import React, { useRef, useState } from "react";
import "../../index.css";
import HighlightedText from "./HighlightedText";
import { colorMappings, HighlightedError } from "../../types";
import {
  DIFF_DELETE,
  DIFF_EQUAL,
  DIFF_INSERT,
  diff_match_patch,
} from "diff-match-patch";

type PostEditContainerProps = {
  machineTranslation: string;
  highlightedError: HighlightedError[];
};

// **PostEditContainer Component**
export const PostEditContainer: React.FC<PostEditContainerProps> = ({
  machineTranslation,
  highlightedError,
}) => {
  const [insertSpanActive, setInsertSpanActive] = useState(false);
  const [diffText, setDiffText] = useState("");

  const editableDivRef = useRef<HTMLDivElement>(null);

  const applyHighlight = () => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    const start = range.startOffset;
    const end = range.endOffset;

    const span = document.createElement("span");
    // span.className = `highlight ${selectedSpan ? "highlight-selected" : ""}`;
    span.style.backgroundColor = Object.values(colorMappings)[0];

    // span.onmouseenter = (e) =>
    //   handleMouseEnterSpan && handleMouseEnterSpan(e, highlightedError[0]);

    range.surroundContents(span);
  };

  const handleInput = () => {
    const newText = editableDivRef.current?.innerText || "";
    // setCurrentText(newText);
    generateDiff(machineTranslation, newText);
  };

  const generateDiff = (original: string, modified: string) => {
    const dmp = new diff_match_patch();
    const diffs = dmp.diff_main(original, modified);
    dmp.diff_cleanupSemantic(diffs);

    let result = "";

    diffs.forEach(([type, text]) => {
      if (type === DIFF_INSERT) {
        result += `<span class="post-edit-additions">${text}</span>`;
      } else if (type === DIFF_DELETE) {
        result += `<span class="post-edit-deletions">${text}</span>`;
      } else if (type === DIFF_EQUAL) {
        result += text;
      }
    });

    setDiffText(result);
  };

  //   Return JSX
  return (
    <div>
      <div className="post-edit-section">
        <h3>Post-Editing</h3>
        <button
          className={`insert-span-button ${
            insertSpanActive ? "insert-span-button-active" : ""
          }`}
          onClick={applyHighlight}
        >
          Insert Span
        </button>
        <button className="custom-correction-button">Custom Correction</button>

        <div
          className="post-edit-translation-field"
          ref={editableDivRef}
          onInput={() => handleInput && handleInput()}
          contentEditable={true}
          suppressContentEditableWarning={true}
        >
          <HighlightedText
            text={machineTranslation}
            highlights={highlightedError}
            highlightKey="end_index_translation"
          />
        </div>
      </div>

      <div className="changes" dangerouslySetInnerHTML={{ __html: diffText }} />
    </div>
  );
};
