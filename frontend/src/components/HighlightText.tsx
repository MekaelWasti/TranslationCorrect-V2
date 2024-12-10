// import React from "react";
// import { HighlightedError, colorMappings } from "../types";
// import "../index.css";

// // **Interfaces**

// // HighlightTextProps Interface
// interface HighlightTextProps {
//   text: string;
//   highlights: HighlightedError[];
//   highlightKey:
//     | "start_index_orig"
//     | "end_index_orig"
//     | "start_index_translation"
//     | "end_index_translation"
//     | "error_type";
//   onMouseEnter?: (
//     e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
//     highlight: HighlightedError
//   ) => void;
//   onMouseLeave?: (
//     e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
//     highlight: HighlightedError
//   ) => void;
//   onMouseMove?: (
//     e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
//     highlight: HighlightedError
//   ) => void;
//   onMouseDown?: () => void;
//   selectedSpan?: string | null;
// }

// // **HighlightText Component**
// const HighlightText: React.FC<HighlightTextProps> = ({
//   text,
//   highlights,
//   highlightKey,
//   onMouseEnter,
//   onMouseLeave,
//   onMouseMove,
//   onMouseDown,
//   selectedSpan,
// }) => {
//   // **Functions**

//   const mergeRanges = (
//     ranges: { start: number; end: number; error_type: string }[]
//   ) => {
//     if (!ranges.length) return [];

//     ranges.sort((a, b) => a.start - b.start);

//     const result = [];
//     let { start, end, error_type } = ranges[0];

//     for (const range of ranges) {
//       if (range.start <= end) {
//         end = Math.max(end, range.end);
//         if (range.end > end) error_type = range.error_type; // Update error type if necessary
//       } else {
//         result.push({ start, end, error_type });
//         ({ start, end, error_type } = range);
//       }
//     }

//     result.push({ start, end, error_type });

//     return result;
//   };

//   // Dynamic Highlghting Function
//   const getHighlightedText = (
//     text: string,
//     highlights: HighlightedError[],
//     highlightKey: keyof HighlightedError
//   ) => {
//     const ranges = highlights.map((highlight) => {
//       const startKey = highlightKey.includes("end")
//         ? (highlightKey.replace("end", "start") as keyof HighlightedError)
//         : highlightKey;
//       return {
//         start: highlight[startKey] as number,
//         end: highlight[highlightKey] as number,
//         error_type: highlight.error_type,
//       };
//     });

//     const mergedRanges = mergeRanges(ranges);

//     let lastIndex = 0;
//     const elements = [];

//     mergedRanges.forEach((range, index) => {
//       const { start, end, error_type } = range;

//       if (start > lastIndex) {
//         elements.push(
//           <span key={`text-${index}`}>{text.substring(lastIndex, start)}</span>
//         );
//       }

//       //   Append Nested JSX Elements to elements array
//       // console.log("Selected Span", selectedSpan);
//       elements.push(
//         <span
//           key={`highlight-${index}`}
//           className={`highlight ${
//             selectedSpan === error_type ? "highlight-selected" : ""
//           }`}
//           style={{ backgroundColor: colorMappings[error_type] }}
//           onMouseEnter={(e) =>
//             onMouseEnter && onMouseEnter(e, highlights[index])
//           }
//           onMouseLeave={(e) =>
//             onMouseLeave && onMouseLeave(e, highlights[index])
//           }
//           onMouseMove={(e) => onMouseMove && onMouseMove(e, highlights[index])}
//           onMouseDown={(e) => onMouseDown && onMouseDown(e, highlights[index])}
//         >
//           {text.substring(start, end)}
//         </span>
//       );

//       lastIndex = end;
//     });

//     if (lastIndex < text.length) {
//       elements.push(<span key="text-end">{text.substring(lastIndex)}</span>);
//     }

//     return elements;
//   };

//   //   Return JSX
//   return <span>{getHighlightedText(text, highlights, highlightKey)}</span>;
// };

// export default HighlightText;
