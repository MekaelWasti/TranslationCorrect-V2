// import React, { ChangeEvent, useState, useRef, useEffect } from "react";
// import HighlightText from "./HighlightText";
// import { HighlightedError, colorMappings } from "../types";
// import {
//   diff_match_patch,
//   DIFF_INSERT,
//   DIFF_DELETE,
//   DIFF_EQUAL,
// } from "diff-match-patch";
// import "../index.css";

// const App: React.FC = () => {
//   // **States**

//   const referenceTranslation =
//     "斯坦福大学医学院的学生周一宣布发明了一种新的诊断工具，可以按微型印刷芯片的形式对细胞进行分类.";

//   const machineTranslation =
//     "Students from Stanford University Medical School announced Monday the invention of a new diagnostic tool that can sort cells by type, in the form of a miniature printed chip";

//   const [postEditTranslation, setPostEditTranslation] =
//     useState(machineTranslation);

//   const [insertSpanActive, setInsertSpanActive] = useState(false);
//   const [currentText, setCurrentText] = useState(machineTranslation);
//   const [diffText, setDiffText] = useState("");
//   const editableDivRef = useRef<HTMLDivElement>(null);
//   const dmp = new diff_match_patch();

//   useEffect(() => {
//     setCurrentText(machineTranslation);
//   }, [machineTranslation]);

//   const [hoveredHighlight, setHoveredHighlight] =
//     useState<HighlightedError | null>();

//   const [selectedSpan, setSelectedSpan] = useState("");

//   const [tooltipStyle, setTooltipStyle] = useState({
//     top: 0,
//     left: 0,
//   });

//   const [spanDropdown, setSpanDropdown] = useState(false);
//   const [spanPosition, setSpanPosition] = useState<{
//     top: number;
//     left: number;
//   } | null>(null);

//   const [mousePosition, setMousePosition] = useState<{
//     x: number;
//     y: number;
//   } | null>(null);

//   const [highlightedError, setHighlightedError] = useState<HighlightedError[]>([
//     {
//       original_text: "赢得比赛",
//       translated_text: "win the game",
//       correct_text: "win the match",
//       start_index_orig: 2,
//       end_index_orig: 3,
//       start_index_translation: 9,
//       end_index_translation: 14,
//       error_type: "Hallucinations",
//     },
//     {
//       original_text: "赢得比赛",
//       translated_text: "win the game",
//       correct_text: "win the match",
//       start_index_orig: 4,
//       end_index_orig: 9,
//       start_index_translation: 19,
//       end_index_translation: 28,
//       error_type: "Addition of Text",
//     },
//   ]);

//   // Scoring States
//   const [spanScores, setSpanScores] = useState<{ [key: string]: number }>({});
//   const [overallScore, setOverallScore] = useState<number>(50);

//   // **Event Handlers**

//   const handleMouseEnterSpan = (
//     e: React.MouseEvent<HTMLSpanElement>,
//     highlight: HighlightedError
//   ) => {
//     if (!spanDropdown) {
//       setHoveredHighlight(highlight);
//     }

//     const rect = e.currentTarget.getBoundingClientRect();
//     setSpanPosition({
//       top: rect.top + window.scrollY,
//       left: rect.left + window.scrollX,
//     });
//   };

//   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (hoveredHighlight || spanDropdown) {
//       setMousePosition({ x: e.clientX, y: e.clientY });
//     }

//     setTooltipStyle({
//       top: e.pageY + 25,
//       left: e.pageX - 125,
//     });
//   };

//   const handleMouseLeaveSpan = (
//     e: React.MouseEvent<HTMLSpanElement>,
//     highlight: HighlightedError
//   ) => {
//     setHoveredHighlight(null);
//   };

//   const handleMouseClick = (
//     e: React.MouseEvent<HTMLSpanElement>,
//     highlight: HighlightedError
//   ) => {
//     setSpanDropdown(!spanDropdown);
//     setHoveredHighlight(null);
//     setSelectedSpan(highlight.error_type);
//   };

//   const handlePostEditTyping = (e: ChangeEvent<HTMLTextAreaElement>) => {
//     setPostEditTranslation(e.target.value);
//   };

//   const applyHighlight = () => {
//     const selection = window.getSelection();
//     if (!selection?.rangeCount) return;

//     const range = selection.getRangeAt(0);
//     const start = range.startOffset;
//     const end = range.endOffset;

//     const span = document.createElement("span");
//     span.className = `highlight ${selectedSpan ? "highlight-selected" : ""}`;
//     span.style.backgroundColor = Object.values(colorMappings)[0];

//     span.onmouseenter = (e) =>
//       handleMouseEnterSpan && handleMouseEnterSpan(e, highlightedError[0]);

//     range.surroundContents(span);
//   };

//   const handleInput = () => {
//     const newText = editableDivRef.current?.innerText || "";
//     setCurrentText(newText);
//     generateDiff(machineTranslation, newText);
//   };

//   const generateDiff = (original: string, modified: string) => {
//     const diffs = dmp.diff_main(original, modified);
//     dmp.diff_cleanupSemantic(diffs);

//     let result = "";

//     diffs.forEach(([type, text]) => {
//       if (type === DIFF_INSERT) {
//         result += `<span class="post-edit-additions">${text}</span>`;
//       } else if (type === DIFF_DELETE) {
//         result += `<span class="post-edit-deletions">${text}</span>`;
//       } else if (type === DIFF_EQUAL) {
//         result += text;
//       }
//     });

//     setDiffText(result);
//   };

//   const handleInsertSpan = () => {
//     setInsertSpanActive(!insertSpanActive);
//   };

//   const handleSpanScoreChange = (index: string, score: number) => {
//     setSpanScores((prevScores) => ({ ...prevScores, [index]: score }));
//   };

//   const handleOverallScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setOverallScore(Number(e.target.value));
//   };

//   {
//     /* TODO: Currently Doing */
//   }

//   const handleClickToInsertSpan = (e: React.MouseEvent<HTMLButtonElement>) => {
//     console.log("Insert Span");
//     console.log(e.target);
//   };

//   // **JSX**
//   return (
//     <div className="body">
//       <h2>Test Env</h2>
//       <div className="divider"></div>
//       <h3>Source</h3>
//       <div>
//         <HighlightText
//           text={referenceTranslation}
//           highlights={highlightedError}
//           highlightKey="end_index_orig"
//           onMouseEnter={handleMouseEnterSpan}
//           onMouseLeave={handleMouseLeaveSpan}
//           onMouseMove={handleMouseMove}
//           onMouseDown={handleMouseClick}
//           selectedSpan={selectedSpan}
//         />
//       </div>
//       <br />
//       <br />
//       <h3>Machine Translation</h3>
//       <div>
//         <HighlightText
//           text={machineTranslation}
//           highlights={highlightedError}
//           highlightKey="end_index_translation"
//           onMouseEnter={handleMouseEnterSpan}
//           onMouseLeave={handleMouseLeaveSpan}
//           onMouseMove={handleMouseMove}
//           onMouseDown={handleMouseClick}
//           selectedSpan={selectedSpan}
//         />
//       </div>

//       {hoveredHighlight && mousePosition && (
//         <div className="error-tooltip" style={tooltipStyle}>
//           <p style={{ color: colorMappings[hoveredHighlight.error_type] }}>
//             <strong>Error Type:</strong> {hoveredHighlight.error_type}
//           </p>
//           <p>
//             <strong>Original Text:</strong> {hoveredHighlight.original_text}
//           </p>
//           <p>
//             <strong>Translated Text:</strong> {hoveredHighlight.translated_text}
//           </p>
//           <p>
//             <strong>Correct Text:</strong> {hoveredHighlight.correct_text}
//           </p>
//         </div>
//       )}

//       <div className="divider"></div>

//       {/* TODO: Currently Doing */}

//       <span className="insert-highlight-test">
//         Students from Stanford University Medical School announced Monday the
//         invention of a new diagnostic tool that can sort cells by type, in the
//         form of a miniature printed chip
//       </span>

//       <div className="post-edit-section">
//         <h3>Post-Editing</h3>
//         <button
//           className={`insert-span-button ${
//             insertSpanActive ? "insert-span-button-active" : ""
//           }`}
//           onClick={applyHighlight}
//         >
//           Insert Span
//         </button>
//         <button className="custom-correction-button">Custom Correction</button>

//         <div
//           className="post-edit-translation-field"
//           ref={editableDivRef}
//           onInput={handleInput}
//           contentEditable={true}
//           suppressContentEditableWarning={true}
//           onMouseDown={handleClickToInsertSpan}
//         >
//           <HighlightText
//             text={machineTranslation}
//             highlights={highlightedError}
//             highlightKey="end_index_translation"
//             onMouseEnter={handleMouseEnterSpan}
//             onMouseLeave={handleMouseLeaveSpan}
//             onMouseMove={handleMouseMove}
//             onMouseDown={handleMouseClick}
//             selectedSpan={selectedSpan}
//           />
//         </div>
//       </div>

//       <div className="changes" dangerouslySetInnerHTML={{ __html: diffText }} />

//       {spanDropdown && mousePosition && (
//         <div
//           className="span-dropdown"
//           style={{
//             position: "absolute",
//             left: spanPosition.left - 20,
//             top: spanPosition.top + 25,
//           }}
//         >
//           <ul>
//             {Object.keys(colorMappings).map((key) => (
//               <div className="dropdown-selection">
//                 <li
//                   style={{
//                     "--hover-color": colorMappings[key],
//                   }}
//                   key={key}
//                 >
//                   <p>{key}</p>
//                 </li>
//                 <hr className="dropdown-divider" />
//               </div>
//             ))}
//           </ul>
//         </div>
//       )}

//       {/* Scoring Section */}

//       <div className="scoring-section">
//         <div className="span-score-section">
//           <h3>{selectedSpan} Span Score</h3>
//           <div className="slider-section">
//             <h4>0</h4>
//             <input
//               className="span-slider"
//               type="range"
//               min="0"
//               max="100"
//               value={spanScores[selectedSpan] || 50}
//               onChange={(e) =>
//                 handleSpanScoreChange(selectedSpan, Number(e.target.value))
//               }
//             />
//             <h4>100</h4>
//           </div>
//           <p>Score: {spanScores[selectedSpan] || 50}</p>
//         </div>

//         <div className="scoring-divider"></div>

//         <div className="overall-score-section">
//           <h3>Overall Translation Score</h3>
//           <div className="slider-section">
//             <h4>0</h4>
//             <input
//               className="span-slider"
//               type="range"
//               min="0"
//               max="100"
//               value={overallScore}
//               onChange={handleOverallScoreChange}
//             />
//             <h4>100</h4>
//           </div>
//           <p>Score: {overallScore}</p>
//         </div>
//       </div>

//       {/* Displaying All Span Scores */}
//       <div className="span-scores-display">
//         <h3>All Span Scores</h3>
//         {Object.entries(spanScores).map(([index, score]) => (
//           <p key={index}>
//             Span {index}: {score}
//           </p>
//         ))}
//       </div>

//       <div className="accept-translation-section">
//         <button>Submit Annotation</button>
//       </div>

//       <div className="send-feedback">
//         <a>Send Feedback</a>
//       </div>
//     </div>
//   );
// };

// export default App;
