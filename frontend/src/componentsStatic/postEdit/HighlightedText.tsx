import React, { useState, useRef, useEffect } from "react";
import { HighlightedError, colorMappings } from "../../types";
import "../../index.css";
import { useSpanEvalContext } from "../SpanEvalProvider";

type HighlightTextProps = {
  text: React.ReactNode;
  highlights: HighlightedError[];
  highlightKey:
    | "start_index_orig"
    | "end_index_orig"
    | "start_index_translation"
    | "end_index_translation"
    | "error_type";
  disableEdit?: boolean;
};

const HighlightedText: React.FC<HighlightTextProps> = ({
  text,
  highlights,
  highlightKey,
  disableEdit = false,
}) => {
  const { selectedSpanIdx, setSelectedSpanIdx } = useSpanEvalContext();
  const dropdownRef = useRef(null);

  const [selectedSpan, setSelectedSpan] = useState("");
  const [spanDropdown, setSpanDropdown] = useState(false);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [errTypeEdit, setErrTypeEdit] = useState<{ [key: number]: string }>({});

  const [tooltipStyle, setTooltipStyle] = useState({ top: 0, left: 0 });
  const [spanPosition, setSpanPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [hoveredHighlight, setHoveredHighlight] =
    useState<HighlightedError | null>(null);

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

  const handleMouseClick = (
    e: React.MouseEvent<HTMLSpanElement>,
    highlight: HighlightedError,
    highlightIdx: number
  ) => {
    // Prevent left click from opening drop down menu since it is used for custom insertion
    if (e.button === 0) {
      return;
    }

    if (highlight.error_type === selectedSpan && spanDropdown) {
      setSpanDropdown(false);
    } else {
      setSelectedSpan(highlight.error_type);
      setSpanDropdown(true);
      setHoveredHighlight(highlight);

      const rect = e.currentTarget.getBoundingClientRect();
      setSpanPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
    setHoveredHighlight(null);
    setSelectedSpanIdx(highlightIdx);
    e.stopPropagation();
  };

  useEffect(() => {
    const handleClickOutsideDropDown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSpanDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutsideDropDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideDropDown);
    };
  }, [spanDropdown]);

  const handleTypeSelect = (type: string) => {
    setErrTypeEdit((prevEdits) => ({ ...prevEdits, [selectedSpanIdx!]: type }));
    setSpanDropdown(false);
    // TODO: Update SpanEvalProvider with the new error type
  };

  // Prepare ranges with indices
  const ranges = highlights.map((highlight, idx) => {
    const startKey = highlightKey.includes("end")
      ? (highlightKey.replace("end", "start") as keyof HighlightedError)
      : highlightKey;
    return {
      start: highlight[startKey] as number,
      end: highlight[highlightKey] as number,
      error_type: highlight.error_type,
      highlight,
      index: idx, // Track highlight index
    };
  });

  const getHighlightedText = (nodes, highlights, currentIndex = 0) => {
    let elements = [];
    let localIndex = currentIndex;

    nodes.forEach((node, idx) => {
      if (typeof node === "string") {
        const nodeText = node;
        const nodeLength = nodeText.length;
        const nodeStartIndex = localIndex;
        const nodeEndIndex = localIndex + nodeLength;

        const nodeHighlights = highlights.filter(
          (h) => h.start < nodeEndIndex && h.end > nodeStartIndex
        );

        if (nodeHighlights.length === 0) {
          elements.push(nodeText);
        } else {
          let lastIndex = 0;
          const fragments = [];

          nodeHighlights
            .sort((a, b) => a.start - b.start)
            .forEach((h) => {
              const highlightStart = Math.max(h.start - nodeStartIndex, 0);
              const highlightEnd = Math.min(h.end - nodeStartIndex, nodeLength);

              if (highlightStart > lastIndex) {
                fragments.push(nodeText.substring(lastIndex, highlightStart));
              }

              const highlightedText = nodeText.substring(
                highlightStart,
                highlightEnd
              );
              fragments.push(
                <span
                  key={`highlight-${nodeStartIndex + highlightStart}`}
                  className={`highlight ${
                    selectedSpanIdx === h.index && !disableEdit
                      ? "highlight-selected"
                      : ""
                  }`}
                  style={{
                    backgroundColor:
                      colorMappings[errTypeEdit[h.index]] ??
                      colorMappings[h.error_type],
                  }}
                  onMouseEnter={(e) => handleMouseEnterSpan(e, h.highlight)}
                  onMouseLeave={handleMouseLeaveSpan}
                  onMouseMove={handleMouseMove}
                  onMouseDown={(e) =>
                    !disableEdit && handleMouseClick(e, h.highlight, h.index)
                  }
                  onContextMenu={(e) => {
                    // Stop context menu from appearing on right click in post edit section
                    if (!disableEdit) {
                      e.preventDefault();
                    }
                  }}
                >
                  {highlightedText}
                </span>
              );

              lastIndex = highlightEnd;
            });

          if (lastIndex < nodeLength) {
            fragments.push(nodeText.substring(lastIndex));
          }

          elements.push(...fragments);
        }

        localIndex += nodeLength;
      } else if (React.isValidElement(node)) {
        const childNodes = React.Children.toArray(node.props.children);
        const { elements: childElements, currentIndex: newIndex } =
          getHighlightedText(childNodes, highlights, localIndex);

        localIndex = newIndex;

        elements.push(
          React.cloneElement(node, { key: `node-${idx}` }, childElements)
        );
      }
    });

    return { elements, currentIndex: localIndex };
  };

  const { elements } = getHighlightedText(React.Children.toArray(text), ranges);

  return (
    <div>
      {elements}
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
          ref={dropdownRef}
          className="span-dropdown"
          style={{
            position: "absolute",
            left: spanPosition.left - 20,
            top: spanPosition.top + 25,
          }}
        >
          <ul>
            {Object.keys(colorMappings).map((errorType) => (
              <div className="dropdown-selection" key={errorType}>
                <li
                  style={{
                    "--hover-color": colorMappings[errorType],
                  }}
                  onClick={() => handleTypeSelect(errorType)}
                >
                  <p>{errorType}</p>
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
