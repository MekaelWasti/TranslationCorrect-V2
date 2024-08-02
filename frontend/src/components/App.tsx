import React, { useState } from "react";
import HighlightText from "./HighlightText";
import { HighlightedError, colorMappings } from "../types";
import "../index.css";

const App: React.FC = () => {
  // **States**

  // Highlighted Span State
  const [hoveredHighlight, setHoveredHighlight] =
    useState<HighlightedError | null>();

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

  // Placeholder Sentences
  const sentenceToBeHighlighted =
    "斯坦福大学医学院的学生周一宣布发明了一种新的诊断工具，可以按微型印刷芯片的形式对细胞进行分类.";
  // const originalSentence = "Cause they don't want to see you win dawg";
  const originalSentence =
    "Students from Stanford University Medical School announced Monday the invention of a new diagnostic tool that can sort cells by type, in the form of a miniature printed chip";

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
    console.log(spanDropdown);
  };

  // **JSX**
  return (
    <div>
      <h2>Test Env</h2>
      <div className="divider"></div>
      <h3>Source</h3>
      <div>
        <HighlightText
          text={sentenceToBeHighlighted}
          highlights={highlightedError}
          highlightKey="end_index_orig"
          onMouseEnter={handleMouseEnterSpan}
          onMouseLeave={handleMouseLeaveSpan}
          onMouseMove={handleMouseMove}
          onMouseClick={handleMouseClick}
        />
      </div>
      <br />
      <br />
      {/* Machine Translation */}
      <h3>Machine Translation</h3>
      <div>
        <HighlightText
          text={originalSentence}
          highlights={highlightedError}
          highlightKey="end_index_translation"
          onMouseEnter={handleMouseEnterSpan}
          onMouseLeave={handleMouseLeaveSpan}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseClick}
        />
      </div>
      {/* Highlight Tooltip */}
      {/* {hoveredHighlight && ( */}
      {hoveredHighlight && mousePosition && (
        <div
          className="error-tooltip"
          style={{
            position: "absolute",
            left: mousePosition.x - 100, // Add offset to avoid cursor overlap
            top: mousePosition.y + 20, // Add offset to avoid cursor overlap
          }}
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
      <div className="edit-context">
        <h3>Edit Context</h3>
        <button className="insert-span-button">Insert Span</button>
        <button className="custom-correction-button">Custom Correction</button>

        <div className="edit-context-translation-field">
          <textarea
            name="edit-context-translation"
            id="edit-context-translation"
            placeholder="Edit Translation"
          ></textarea>
        </div>
      </div>

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
      {/* Scoring Slider */}
      <div className="scoring-slider-section">
        <div className="span-score-section">
          <h3>-- Span Score</h3>
          <div className="slider-section">
            <h4>0</h4>
            <input className="span-slider" type="range" />
            <h4>1</h4>
          </div>
        </div>
        <div className="overall-score-section"></div>
      </div>

      {/* Accept Translation Section */}
      <div className="accept-translation-section">
        <button>Accept Translation</button>
      </div>

      <div className="send-feedback">
        <a>Send Feedback</a>
      </div>
    </div>
  );
};

export default App;
