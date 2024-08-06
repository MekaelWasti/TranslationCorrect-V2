import React, { ChangeEvent, useState, useRef, useEffect } from "react";
import HighlightText from "./HighlightText";
import { HighlightedError, colorMappings } from "../types";
import {
  diff_match_patch,
  DIFF_INSERT,
  DIFF_DELETE,
  DIFF_EQUAL,
} from "diff-match-patch";
import "../index.css";

const App: React.FC = () => {
  // **States**

  // Placeholder Sentences
  const referenceTranslation =
    "斯坦福大学医学院的学生周一宣布发明了一种新的诊断工具，可以按微型印刷芯片的形式对细胞进行分类.";
  // const machineTranslation = "Cause they don't want to see you win dawg";
  const machineTranslation =
    "Students from Stanford University Medical School announced Monday the invention of a new diagnostic tool that can sort cells by type, in the form of a miniature printed chip";

  // Post-Edit Section
  const [postEditTranslation, setPostEditTranslation] =
    useState(machineTranslation);

  const [insertSpanActive, setInsertSpanActive] = useState(false);

  const [currentText, setCurrentText] = useState(machineTranslation);
  const [diffText, setDiffText] = useState("");
  const editableDivRef = useRef<HTMLDivElement>(null);
  const dmp = new diff_match_patch();

  useEffect(() => {
    setCurrentText(machineTranslation);
  }, [machineTranslation]);

  // Highlighted Span State
  const [hoveredHighlight, setHoveredHighlight] =
    useState<HighlightedError | null>();

  const [selectedSpan, setSelectedSpan] = useState("");

  const [tooltipStyle, setTooltipStyle] = useState({
    top: 0,
    left: 0,
  });

  const [spanDropdown, setSpanDropdown] = useState(false);
  const [spanPosition, setSpanPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Placeholder Highlight Errors
  const [highlightedError, setHighlightedError] = useState<HighlightedError[]>([
    {
      original_text: "赢得比赛",
      translated_text: "win the game",
      correct_text: "win the match",
      start_index_orig: 2,
      end_index_orig: 3,
      start_index_translation: 9,
      end_index_translation: 14,
      error_type: "Hallucinations",
    },
    {
      original_text: "赢得比赛",
      translated_text: "win the game",
      correct_text: "win the match",
      start_index_orig: 4,
      end_index_orig: 9,
      start_index_translation: 19,
      end_index_translation: 28,
      error_type: "Addition of Text",
    },
  ]);

  // **Event Handlers**
  const handleMouseEnterSpan = (
    e: React.MouseEvent<HTMLSpanElement>,
    highlight: HighlightedError
  ) => {
    console.log("Mouse Enter", e.currentTarget);
    console.log("Mouse Entered on higlight", highlight);

    if (!spanDropdown) {
      setHoveredHighlight(highlight);
    }
    // setMousePosition({ x: e.clientX, y: e.clientY });

    const rect = e.currentTarget.getBoundingClientRect();
    setSpanPosition({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoveredHighlight || spanDropdown) {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }

    setTooltipStyle({
      top: e.pageY + 25,
      left: e.pageX - 125,
      // display: "block",
    });
  };

  const handleMouseLeaveSpan = (
    e: React.MouseEvent<HTMLSpanElement>,
    highlight: HighlightedError
  ) => {
    console.log("Mouse Leave", e.currentTarget);
    setHoveredHighlight(null);
  };

  const handleMouseClick = (
    e: React.MouseEvent<HTMLSpanElement>,
    highlight: HighlightedError
  ) => {
    setSpanDropdown(!spanDropdown);
    setHoveredHighlight(null);
    setSelectedSpan(highlight.error_type);
    console.log(spanDropdown);
  };

  // Post-Edit Area Handlers

  const handlePostEditTyping = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPostEditTranslation(e.target.value);
  };

  {
    /* TODO: Currently Doing */
  }

  const applyHighlight = () => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;

    const range = selection.getRangeAt(0);
    const start = range.startOffset;
    const end = range.endOffset;

    // Assuming `selectedSpan` and `colorMappings` are available in the scope
    const span = document.createElement("span");
    span.className = `highlight ${selectedSpan ? "highlight-selected" : ""}`;
    span.style.backgroundColor = Object.values(colorMappings)[0];

    // Set up event handlers if needed
    span.onmouseenter = (e) =>
      handleMouseEnterSpan && handleMouseEnterSpan(e, highlightedError[0]);
    // span.onmouseleave = (e) =>
    //   handleMouseLeaveSpan && handleMouseLeaveSpan(e, highlightedError[0]);
    // span.onmousemove = (e) => handleMouseMove && handleMouseMove(e);
    // span.onmousedown = (e) =>
    //   handleMouseClick && handleMouseClick(e, highlightedError[0]);

    range.surroundContents(span);
  };

  const handleInput = () => {
    const newText = editableDivRef.current?.innerText || "";
    setCurrentText(newText);
    generateDiff(machineTranslation, newText);
  };

  const generateDiff = (original: string, modified: string) => {
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

  const handleInsertSpan = () => {
    setInsertSpanActive(!insertSpanActive);
  };

  // **JSX**
  return (
    <div className="body">
      <h2>Test Env</h2>
      <div className="divider"></div>
      <h3>Source</h3>
      <div>
        <HighlightText
          text={referenceTranslation}
          highlights={highlightedError}
          highlightKey="end_index_orig"
          onMouseEnter={handleMouseEnterSpan}
          onMouseLeave={handleMouseLeaveSpan}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseClick}
          selectedSpan={selectedSpan}
        />
      </div>
      <br />
      <br />
      {/* Machine Translation */}
      <h3>Machine Translation</h3>
      <div>
        <HighlightText
          text={machineTranslation}
          highlights={highlightedError}
          highlightKey="end_index_translation"
          onMouseEnter={handleMouseEnterSpan}
          onMouseLeave={handleMouseLeaveSpan}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseClick}
          selectedSpan={selectedSpan}
        />
      </div>
      {/* Highlight Tooltip */}
      {/* {hoveredHighlight && ( */}
      {hoveredHighlight && mousePosition && (
        <div
          className="error-tooltip"
          style={tooltipStyle}
          // style={{
          // position: "absolute",
          // left: mousePosition.x - 100, // Add offset to avoid cursor overlap
          // top: mousePosition.y + 20, // Add offset to avoid cursor overlap
          // }}
        >
          <p
            style={{
              color: colorMappings[hoveredHighlight.error_type],
            }}
          >
            <strong>Error Type:</strong> {hoveredHighlight.error_type}
          </p>
          <p>
            <strong>Original Text:</strong> {hoveredHighlight.original_text}
          </p>
          <p>
            <strong>Translated Text:</strong> {hoveredHighlight.translated_text}
          </p>
          <p>
            <strong>Correct Text:</strong> {hoveredHighlight.correct_text}
          </p>
        </div>
      )}
      {/* Highlight Tooltip */}
      <div className="divider"></div>
      <div className="post-edit-section">
        <h3>Post-Editing</h3>
        <button
          className={`insert-span-button ${
            insertSpanActive ? "insert-span-button-active" : ""
          }`}
          // onMouseDown={handleInsertSpan}
          onClick={applyHighlight}
        >
          Insert Span
        </button>
        <button className="custom-correction-button">Custom Correction</button>

        <div
          className="post-edit-translation-field"
          // value={postEditTranslation}
          // onInput={handlePostEditTyping}
          ref={editableDivRef}
          onInput={handleInput}
          // name="post-edit-translation"
          id="post-edit-translation"
          // placeholder="Edit Translation"
          contentEditable={true}
          suppressContentEditableWarning={true}
        >
          {
            <HighlightText
              text={machineTranslation}
              highlights={highlightedError}
              highlightKey="end_index_translation"
              onMouseEnter={handleMouseEnterSpan}
              onMouseLeave={handleMouseLeaveSpan}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseClick}
              selectedSpan={selectedSpan}
            />
          }
        </div>
        {/* <button onClick={applyHighlight}>Highlight Selection</button> */}
      </div>

      <div className="changes" dangerouslySetInnerHTML={{ __html: diffText }} />

      {/* Span Dropdown */}
      {spanDropdown && mousePosition && (
        <div
          className="span-dropdown"
          style={{
            position: "absolute",
            left: spanPosition.left - 20,
            top: spanPosition.top + 25, // Add offset to place it below the span
          }}
        >
          <ul>
            {Object.keys(colorMappings).map((key) => (
              <div className="dropdown-selection">
                <li
                  style={{
                    "--hover-color": colorMappings[key],
                  }}
                  key={key}
                >
                  <p>{key}</p>
                </li>
                <hr className="dropdown-divider" />
              </div>
            ))}
          </ul>
        </div>
      )}

      {/* TODO: Currently Doing */}
      {/* Scoring Slider */}

      {/* Span Scoring Slider */}
      <div className="scoring-section">
        <div className="span-score-section">
          <h3>{selectedSpan} Span Score</h3>
          <div className="slider-section">
            <h4>0</h4>
            <input className="span-slider" type="range" />
            <h4>1</h4>
          </div>
        </div>
        <div className="overall-score-section"></div>

        <div className="divider"></div>

        {/* Overall Translation Scoring Slider */}
        <div className="scoring-slider-section">
          <div className="span-score-section">
            <h3>{selectedSpan} Span Score</h3>
            <div className="slider-section">
              <h4>0</h4>
              <input className="span-slider" type="range" />
              <h4>1</h4>
              <h4 className="score-display">1</h4>
            </div>
          </div>
          <div className="overall-score-section"></div>
        </div>
      </div>

      {/* Accept Translation Section */}
      <div className="accept-translation-section">
        <button>Submit Annotation</button>
      </div>

      <div className="send-feedback">
        <a>Send Feedback</a>
      </div>
    </div>
  );
};

export default App;
