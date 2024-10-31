import React, { useState } from "react";
import { HighlightedError, colorMappings } from "../../types";
import "../../index.css";
import { mergeRanges } from "../../util/mergeRanges";
import { useSpanEvalContext } from "../SpanEvalProvider";

// **Interfaces**

// HighlightTextProps Interface
type HighlightTextProps = {
  text: string;
  highlights: HighlightedError[];
  highlightKey:
    | "start_index_orig"
    | "end_index_orig"
    | "start_index_translation"
    | "end_index_translation"
    | "error_type";
  disableEdit?: boolean;
};

// **HighlightText Component**
const HighlightedText: React.FC<HighlightTextProps> = ({
  text,
  highlights,
  highlightKey,
  disableEdit = false,
}) => {
  // **Functions**
  const { selectedSpanIdx, setSelectedSpanIdx } = useSpanEvalContext();

  const [spanDropdown, setSpanDropdown] = useState(false);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [tooltipStyle, setTooltipStyle] = useState({
    top: 0,
    left: 0,
  });

  const [spanPosition, setSpanPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [hoveredHighlight, setHoveredHighlight] =
    useState<HighlightedError | null>();

  const handleMouseEnterSpan = (
    e: React.MouseEvent<HTMLSpanElement>,
    highlight: HighlightedError
  ) => {
    if (!spanDropdown) {
      setHoveredHighlight(highlight);
    }

    const rect = e.currentTarget.getBoundingClientRect();
    setSpanPosition({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (hoveredHighlight || spanDropdown) {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }

    setTooltipStyle({
      top: e.pageY + 25,
      left: e.pageX - 125,
    });
  };

  const handleMouseLeaveSpan = () => {
    setHoveredHighlight(null);
  };

  const handleMouseClick = (highlightIdx: number) => {
    setSpanDropdown(!spanDropdown);
    setHoveredHighlight(null);
    setSelectedSpanIdx(highlightIdx);
  };

  // Dynamic Highlghting Function
  const getHighlightedText = (
    text: string,
    highlights: HighlightedError[],
    highlightKey: keyof HighlightedError
  ) => {
    const ranges = highlights.map((highlight) => {
      const startKey = highlightKey.includes("end")
        ? (highlightKey.replace("end", "start") as keyof HighlightedError)
        : highlightKey;
      return {
        start: highlight[startKey] as number,
        end: highlight[highlightKey] as number,
        error_type: highlight.error_type,
      };
    });

    const mergedRanges = mergeRanges(ranges);

    let lastIndex = 0;
    const elements = [];

    mergedRanges.forEach((range, index) => {
      const { start, end, error_type } = range;

      if (start > lastIndex) {
        // add unhighlighted text
        elements.push(
          <span key={`text-${index}`}>{text.substring(lastIndex, start)}</span>
        );
      }

      //   Append Nested JSX Elements to elements array
      elements.push(
        <span
          key={`highlight-${index}`}
          className={`highlight ${
            selectedSpanIdx === index && !disableEdit
              ? "highlight-selected"
              : ""
          }`}
          style={{ backgroundColor: colorMappings[error_type] }}
          onMouseEnter={(e) =>
            handleMouseEnterSpan && handleMouseEnterSpan(e, highlights[index])
          }
          onMouseLeave={() => handleMouseLeaveSpan && handleMouseLeaveSpan()}
          onMouseMove={(e) => handleMouseMove && handleMouseMove(e)}
          onMouseDown={() =>
            disableEdit ? () => {} : handleMouseClick && handleMouseClick(index)
          }
        >
          {text.substring(start, end)}
        </span>
      );

      lastIndex = end;
    });

    if (lastIndex < text.length) {
      elements.push(<span key="text-end">{text.substring(lastIndex)}</span>);
    }

    return elements;
  };

  //   Return JSX
  return (
    <div>
      <span>{getHighlightedText(text, highlights, highlightKey)}</span>
      {hoveredHighlight && mousePosition && (
        <div className="error-tooltip" style={tooltipStyle}>
          <p style={{ color: colorMappings[hoveredHighlight.error_type] }}>
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
      {spanDropdown && mousePosition && (
        <div
          className="span-dropdown"
          style={{
            position: "absolute",
            left: spanPosition!.left - 20,
            top: spanPosition!.top + 25,
          }}
        >
          <ul>
            {Object.keys(colorMappings).map((key) => (
              <div className="dropdown-selection">
                <li key={key}>
                  <p>{key}</p>
                </li>
                <hr className="dropdown-divider" />
              </div>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HighlightedText;
