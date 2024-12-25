// import React, { useState, useRef, useEffect } from "react";
// // import loadingIconGrey from './assets/loading_icon_grey.svg';
// import loadingIconWhite from "./assets/loading_icon_white.svg";
// // import parse from 'html-react-parser';
// import DOMPurify from "dompurify";
// import "./App.css";
// import "./index.css";

// interface ApiResponse {
//   received_string: string;
//   response: string;
//   spans: {
//     errors: ErrorType[];
//   };
//   highlights: string;
// }

// interface ErrorType {
//   original_text: string;
//   translated_text: string;
//   correct_text: string;
//   start_index_orig: number;
//   end_index_orig: number;
//   start_index_translation: number;
//   end_index_translation: number;
//   error_type: string;
// }

// const App: React.FC = () => {
//   const sourceTextRef = useRef(null);
//   const translationTextRef = useRef<HTMLDivElement | null>(null);

//   const [sanitizedHtmlString, setSanitizedHtmlString] = useState(
//     // "<span><span class='highlight' style='background-color: #00A0F0; padding: 0vh 0vw 0vh 0vw; zIndex: 0'>Student</span>s from Stanford University Medical School an<span class='highlight' style='background-color: #D3365A; padding: 1vh 0vw 1vh 0vw; zIndex: 1'>nounced Monday the invention of a new diag<span class='highlight' style='background-color: #59c00aba; padding: 2vh 0vw 2vh 0vw; zIndex: 2'>nostic tool tha</span></span>t can sort cells by type of small printed chip</span>"
//     // "<span><span id='highlight-0' class='highlight' onMouseMove={handleMouseMove(event)} onMouseLeave={handleMouseLeave(event)} onMouseEnter={handleMouseEnter(event)} style='background-color: #00A0F0; padding: 0vh 0vw 0vh 0vw; zIndex: 0'>Student</span>s from Stanford University Medical School an<span id='highlight-1' class='highlight' onMouseMove={handleMouseMove(event)} onMouseLeave={handleMouseLeave(event)} onMouseEnter={handleMouseEnter(event)} style='background-color: #D3365A; padding: 1vh 0vw 1vh 0vw; zIndex: 1'>nounced Monday the invention of a new diag<span id='highlight-2' class='highlight' onMouseMove={handleMouseMove(event)} onMouseLeave={handleMouseLeave(event)} onMouseEnter={handleMouseEnter(event)} style='background-color: #59c00aba; padding: 2vh 0vw 2vh 0vw; zIndex: 2'>nostic tool tha</span></span>t can sort cells by type of small printed chip</span>"
//     // "<span><span id='highlight-0' class='highlight' onMouseMove={handleMouseMove(event)} onMouseLeave={handleMouseLeave(event)} onMouseEnter={handleMouseEnter(event)} style='background-color: #FF5733; padding: 0vh 0vw 0vh 0vw; zIndex: 0'>Students from Stanfo</span>rd University Medical School announced Monday the invention of a new diagnostic tool that can sort cells by type of small printed chip</span>"
//     "<span class='machine--translation'; contentEditable= 'true'; onblur='handleBlur(event, 0)';>因为他们不想看到你<span class='highlight' id='highlight-0' style='background-color: #800080; padding: 0vh 0vw 0vh 0vw; zIndex: 0'; contentEditable= 'true'; onblur='handleBlur(event, 0)';>赢得比赛</span>.</span>"
//   );
//   // const spans: { errors: Error[] }[] = [
//   //   {
//   //     errors: [
//   //       {
//   //         original_text: "Учените",
//   //         translated_text: "Students",
//   //         correct_text: "Scientists",
//   //         start_index_orig: 0,
//   //         end_index_orig: 7,
//   //         start_index_translation: 0,
//   //         end_index_translation: 7,
//   //         error_type: "Incorrect Subject",
//   //       },
//   //       {
//   //         original_text: "изобретяването на нов диагностичен инструмент",
//   //         translated_text:
//   //           "the invention of a new diagnostic tool that can sort cells by a type of small printed",
//   //         correct_text: "the invention of a new diagnostic tool",
//   //         start_index_orig: 43,
//   //         end_index_orig: 75,
//   //         start_index_translation: 51,
//   //         end_index_translation: 108,
//   //         error_type: "Incomplete Sentence",
//   //       },
//   //       {
//   //         original_text:
//   //           "който може да сортира клетките по тип: малък печатен чип",
//   //         translated_text: "",
//   //         correct_text: "that can sort cells by type: small printed chip",
//   //         start_index_orig: 75,
//   //         end_index_orig: 131,
//   //         start_index_translation: 86,
//   //         end_index_translation: 108,
//   //         error_type: "Omission",
//   //       },
//   //     ],
//   //   },
//   // ];

//   const [errorLegend, setErrorLegend] = useState<
//     { error_type: string; color: string }[]
//   >([]);

//   type Error = {
//     original_text: string;
//     translated_text: string;
//     correct_text: string;
//     start_index_orig: number;
//     end_index_orig: number;
//     start_index_translation: number;
//     end_index_translation: number;
//     error_type: string;
//     color?: string; // Add the optional color property
//   };

//   // const colors: { [key: string]: string } = {
//   //   "Incorrect Subject": "#00A0F0",
//   //   Omission: "#59c00aba",
//   //   "Incomplete Sentence": "#D3365A",
//   // };

//   const colors = {
//     "Addition of Text": "#FF5733", // Orange-Red
//     "Negation Errors": "#00A0F0", // Bright Blue
//     "Mask In-filling": "#59c00a", // Lime Green
//     "Named Entity (NE) Errors": "#D3365A", // Deep Pink
//     "Number (NUM) Errors": "#8B4513", // Saddle Brown
//     Hallucinations: "#800080", // Purple
//   };

//   // const [highlightedError, setHighlightedError] = useState<any | null>(null);

//   const [highlightedError, setHighlightedError] = useState<any>([
//     {
//       original_text: "赢得比赛",
//       translated_text: "win the game",
//       correct_text: "win the match",
//       start_index_orig: 9,
//       end_index_orig: 13,
//       start_index_translation: 9,
//       end_index_translation: 13,
//       error_type: "Hallucinations",
//     },
//   ]);

//   const [sourceTextInput, setSourceTextInput] = useState(
//     // "Kuwa mbere, abahanga ba siyansi bo mu Ishuri rikuru ry’ubuvuzi rya kaminuza ya Stanford bataganje ko havumbuwe igikoresho gishya cyo gusuzuma gishobora gutandukanya ingirabuzima"
//     null
//   );
//   const [translation, setTranslation] = useState("");
//   const [error_type, setErrorType] = useState("Incorrect Subject");
//   // const [error_spans, setErrorSpans] = useState(spans[0].errors);
//   const [error_spans, setErrorSpans] = useState();
//   const [isLoading, setIsLoading] = useState(false);
//   const [popupStyle, setPopupStyle] = useState({
//     top: 0,
//     left: 0,
//     display: "none",
//   });

//   const handleInputBoxChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     const userInput = e.currentTarget.value;
//     setSourceTextInput(userInput);
//   };

//   const handleSubmission = (
//     e: React.MouseEvent<HTMLButtonElement, MouseEvent>
//   ) => {
//     sendTranslation(sourceTextInput);
//     setIsLoading(true);
//   };

//   const sendTranslation = async (userInput: string) => {
//     try {
//       const response = await fetch(
//         "http://127.0.0.1:63030/submit_translation",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json; charset=UTF-8", // Need UTF-8 encoding
//           },
//           body: JSON.stringify({ value: userInput, translation: "" }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       setIsLoading(false);
//       setTranslation(data.response);

//       console.log(data.highlights);
//       const sanitized = DOMPurify.sanitize(data.highlights);
//       setSanitizedHtmlString(sanitized);

//       // Start Generating Spans Asynchronously
//       fetch_generated_spans(userInput, data.response);
//     } catch (error) {
//       console.error("Error:", error);
//       setIsLoading(false);
//     }
//   };

//   const fetch_generated_spans = async (
//     userInput: string,
//     translation: string
//   ) => {
//     const intervalId = setInterval(async () => {
//       try {
//         const response = await fetch(
//           "http://127.0.0.1:63030/fetch_error_spans",
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json; charset=UTF-8", // Need UTF-8 encoding
//             },
//             body: JSON.stringify({
//               value: userInput,
//               translation: translation,
//             }), // Correctly format the payload
//           }
//         );

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         setErrorSpans(data.error_spans);

//         if (Object.keys(data.error_spans).length > 0) {
//           clearInterval(intervalId); // Stop polling once the data is available
//           console.log("Secondary operation result:", data.error_spans);
//           // Process the result of the secondary operation

//           console.log(data.highlights);
//           console.log(data.error_spans.errors);
//           const sanitized = DOMPurify.sanitize(data.highlights);
//           setSanitizedHtmlString(sanitized);
//           setHighlightedError(data.error_spans.errors);
//         }
//       } catch (error) {
//         console.error("Error:", error);
//       }
//     }, 2000); // Poll every 2 seconds, adjust interval as needed
//   };

//   const handleMouseEnter = (event: MouseEvent) => {
//     const target = event.target as HTMLElement;
//     if (target && target.id) {
//       const index = parseInt(target.id.replace("highlight-", ""), 10);

//       let spans = null;

//       if (highlightedError !== null) {
//         spans = highlightedError;
//       }

//       console.log("SPANS");
//       console.log(spans);

//       const errorType = spans[index].error_type;
//       const currentColor = colors[errorType];

//       if (currentColor) {
//         // Update the error object with the new color key
//         spans[index] = {
//           ...spans[index],
//           color: currentColor,
//         };
//       }

//       setHighlightedError(spans[index]);
//     }

//     const scrollTop = window.scrollY || document.documentElement.scrollTop;
//     const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

//     setPopupStyle({
//       top: 300,
//       left: 150,
//       display: "block",
//     });
//     console.log("Mouse enter", event);
//   };

//   const handleMouseMove = (event: React.MouseEvent) => {
//     // console.log("MOVING", event.clientX, event.clientY);
//     setPopupStyle({
//       top: event.pageY + 50,
//       left: event.pageX - 185,
//       display: "block",
//     });
//   };

//   const handleMouseLeave = () => {
//     // console.log("LEFT");
//     setPopupStyle({ ...popupStyle, display: "none" });
//   };

//   const errorHighlightContainerRef = useRef<HTMLDivElement | null>(null);
//   useEffect(() => {
//     if (errorHighlightContainerRef.current !== null) {
//       errorHighlightContainerRef.current.innerHTML = sanitizedHtmlString;
//       const highlights =
//         errorHighlightContainerRef.current.querySelectorAll(".highlight");
//       // Attach event listeners to each element
//       highlights.forEach((element) => {
//         element.addEventListener("mousemove", handleMouseMove);
//         element.addEventListener("mouseleave", handleMouseLeave);
//         element.addEventListener("mouseenter", handleMouseEnter);
//       });
//       // Cleanup event listeners on component unmount
//       return () => {
//         highlights.forEach((element) => {
//           element.removeEventListener("mousemove", handleMouseMove);
//           element.removeEventListener("mouseleave", handleMouseLeave);
//           element.removeEventListener("mouseenter", handleMouseEnter);
//         });
//       };
//     }
//   }, [sanitizedHtmlString]);

//   // SLIDER SECTION

//   const [value1, setValue1] = useState<number>(50);
//   const [value2, setValue2] = useState<number>(50);
//   const [spanScores, setSpanScores] = useState<{ [key: string]: number }>({});

//   const handleChange1 = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setValue1(Number(event.target.value));
//   };

//   const handleChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setValue2(Number(event.target.value));
//   };

//   const handleSpanClick = (index: number) => {
//     setSpanScores((prevScores) => ({ ...prevScores, [index]: value1 }));
//   };

//   const injectOnClickHandler = (htmlString: string) => {
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(htmlString, "text/html");
//     const spans = doc.querySelectorAll(".highlight");
//     spans.forEach((span, index) => {
//       span.setAttribute("onClick", `handleSpanClick(${index})`);
//       span.setAttribute("data-index", index.toString());
//     });
//     return doc.body.innerHTML;
//   };

//   const enhancedHtmlString = injectOnClickHandler(sanitizedHtmlString);

//   return (
//     <div className="landing-page-parent">
//       <div className="navbar">
//         <ul className="navbar-contents">
//           <li className="navbar-item">
//             <img className="logo" src="favicon.svg" alt="" />
//             <a className="navbar-item-name" href="http://localhost:5173">
//               Translation Error
//             </a>
//           </li>
//         </ul>
//       </div>
//       <div className="input-and-button">
//         <div className="input-container">
//           <div className="wrapper">
//             <ul className="language-bar">
//               <li className="from-languages">
//                 <select>
//                   <option value="en-US">English</option>
//                   <option value="hi-IN">Hindi</option>
//                   <option value="ne-NP">Nepali</option>
//                 </select>
//               </li>
//               <li className="to-languages">
//                 <select>
//                   <option value="zh-TW">Chinese (Traditional)</option>
//                   <option value="en-US">English</option>
//                   <option value="hi-IN">Hindi</option>
//                   <option value="ne-NP">Nepali</option>
//                 </select>
//               </li>
//             </ul>
//             <div className="text-input">
//               <textarea
//                 className="from-text"
//                 onChange={handleInputBoxChange}
//                 placeholder="Type to translate"
//               ></textarea>
//               <div className="to-text-container">
//                 <textarea
//                   className={`to-text ${
//                     isLoading ? "loading-icon-hidden" : ""
//                   }`}
//                   value={translation}
//                   placeholder="Translated text appears here"
//                   readOnly
//                   disabled
//                 ></textarea>
//                 <img
//                   className={`loading-icon ${
//                     isLoading ? "" : "loading-icon-hidden"
//                   }`}
//                   src={loadingIconWhite}
//                   alt=""
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="translate-text-button">
//           <button onClick={handleSubmission}>Translate Text</button>
//         </div>
//       </div>

//       {/* Error Highlighting Section */}

//       <div className="error-highlighting-section">
//         <hr className="divider" />
//         <div className="source-text-highlighting">
//           <h2 className="source-text-title">Original Text</h2>
//           <p ref={sourceTextRef}>{sourceTextInput}</p>
//         </div>

//         <hr className="divider" />
//         <h2 className="source-text-title">Translation Text</h2>

//         <div
//           className="highlight-container"
//           ref={errorHighlightContainerRef}
//           // onMouseMove={handleMouseMove}
//           // onMouseLeave={handleMouseLeave}
//           // onMouseEnter={handleMouseEnter}
//           dangerouslySetInnerHTML={{ __html: sanitizedHtmlString }}
//         />

//         {/*  */}
//         <hr className="divider" />
//         <h2 className="source-text-title">Post Edits</h2>

//         <div
//           className="highlight-container"
//           ref={errorHighlightContainerRef}
//           // onMouseMove={handleMouseMove}
//           // onMouseLeave={handleMouseLeave}
//           // onMouseEnter={handleMouseEnter}
//           dangerouslySetInnerHTML={{ __html: sanitizedHtmlString }}
//         />

//         <div className="error-tooltip-container" style={popupStyle}>
//           <div className="error-tooltip">
//             {highlightedError ? (
//               <>
//                 <h3>Error Type:</h3>
//                 <h3 style={{ color: highlightedError.color }}>
//                   {" "}
//                   {highlightedError.error_type}
//                 </h3>
//                 <p>Original Text: {highlightedError.original_text}</p>
//                 <p>Translated Text: {highlightedError.translated_text}</p>
//                 <p>Correct Text: {highlightedError.correct_text}</p>
//               </>
//             ) : (
//               <p>No highlight selected</p>
//             )}
//           </div>
//         </div>

//         <hr className="divider" />
//         <div className="error-legend-section">
//           <ul>
//             <li>
//               <div
//                 className="color-label"
//                 style={{ backgroundColor: "#113c6a" }}
//               ></div>
//               <p>Incomplete Subject</p>
//             </li>
//             <li>
//               <div
//                 className="color-label"
//                 style={{ backgroundColor: "#2CF551" }}
//               ></div>
//               <p>Omission</p>
//             </li>
//             <li>
//               <div
//                 className="color-label"
//                 style={{ backgroundColor: "#A5304C" }}
//               ></div>
//               <p>Incomplete Sentence</p>
//             </li>
//           </ul>
//         </div>
//         <hr className="divider" />
//       </div>

//       {/* slider Section */}
//       <h2 className="source-text-title">Slider</h2>

//       <div className="slide">
//         Individual Span Scoring
//         <input
//           type="range"
//           min="0"
//           max="100"
//           value={value1}
//           onChange={handleChange1}
//           className="slider"
//         />
//         <p>Value: {value1}</p>
//         <hr className="divider" />
//       </div>
//       <div className="slide">
//         Overall Sentence Scoring
//         <input
//           type="range"
//           min="0"
//           max="100"
//           value={value2}
//           onChange={handleChange2}
//           className="slider"
//         />
//         <p>Value: {value2}</p>
//         <hr className="divider" />
//       </div>
//       <div className="scores">
//         <h2>Scores</h2>
//         {Object.entries(spanScores).map(([index, score]) => (
//           <p key={index}>
//             Span {index}: {score}
//           </p>
//         ))}
//         <p>Overall Sentence Score: {value2}</p>
//       </div>
//       <hr className="divider" />

//       {/* Edit Context Section */}

//       <div className="edit-context-section">
//         <h2 className="">Edit Context</h2>
//         <div className="suggestion-section">
//           This is a suggestion for “extra details”, provided by Option 2. The
//           user can also choose Custom and enter their own text.
//         </div>
//         <hr className="divider" />
//       </div>

//       {/* Rephrase Section */}
//       <div className="rephrase-section">
//         <h2 className="">Rephrase</h2>
//         <button>
//           Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit
//           asperiores doloremque voluptatem voluptas blanditiis sequi, maxime ab
//           ad minima quae!
//         </button>
//         <button>Lorem, ipsum dolor sit adipisicing elit. Ut, sit.</button>
//         <button>Lorem, ipsum Ut, sit.</button>
//         <hr className="divider" />
//       </div>

//       {/* Accept Translation Section */}
//       <div className="accept-translation-section">
//         <button>Accept Translation</button>
//       </div>

//       <div className="send-feedback">
//         <a>Send Feedback</a>
//       </div>
//     </div>
//   );
// };

// export default App;
