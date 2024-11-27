import { DIFF_DELETE, DIFF_INSERT, diff_match_patch } from "diff-match-patch";
import React, { useRef } from "react";
import "../../index.css";
import { HighlightedError } from "../../types";
import { useSpanEvalContext } from "../SpanEvalProvider";
import HighlightedText from "./HighlightedText";

type PostEditContainerProps = {
  machineTranslation: string;
  highlightedError: HighlightedError[];
  onDiffTextUpdate: (newDiffText: React.ReactNode) => void;
};

// **PostEditContainer Component**
export const PostEditContainer: React.FC<PostEditContainerProps> = ({
  machineTranslation,
  highlightedError,
  onDiffTextUpdate,
}) => {
  const editableDivRef = useRef<HTMLDivElement>(null);
  const { translatedText, addNewErrorSpan, setEdits } = useSpanEvalContext();

  const applyHighlight = () => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    // TODO: fix string index bug
    const start = String(translatedText).indexOf(selection.toString());
    addNewErrorSpan(
      start,
      start + selection.toString().length,
      "Addition of Text"
    );
  };

  const handleInput = () => {
    const newText = editableDivRef.current?.innerText || "";
    // setCurrentText(newText);
    generateDiff(machineTranslation, newText);
  };

  const generateDiff = (original: string, modified: string) => {
    const dmp = new diff_match_patch();
    const diffs = dmp.diff_main(original, modified);
    setEdits(diffs as []);
    dmp.diff_cleanupSemantic(diffs);

    console.log("==========");
    console.log(diffs);

    // Convert diffs into React elements
    const diffElements = diffs.map(([type, text], index) => {
      if (type === DIFF_INSERT) {
        return (
          <span className="post-edit-additions" key={`diff-${index}`}>
            {text}
          </span>
        );
      } else if (type === DIFF_DELETE) {
        return (
          <span className="post-edit-deletions" key={`diff-${index}`}>
            {text}
          </span>
        );
      } else {
        // For equal text, return as is
        return text;
      }
    });

    // Convert array of elements to a single React element
    const diffContent = <>{diffElements}</>;

    // Update state and pass the diffContent to parent component
    onDiffTextUpdate(diffContent);
  };

  //   Return JSX
  return (
    <div>
      <div className="post-edit-section">
        <h3>Post-Editing</h3>
        <button className={`insert-span-button`} onClick={applyHighlight}>
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
    </div>
  );
};
