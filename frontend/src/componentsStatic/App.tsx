import React, { useState, useRef, useEffect } from "react";
import loadingIconWhite from "../assets/loading_icon_white.svg";
import logo from "../assets/logo.svg";

import "../index.css";
import DOMPurify from "dompurify";

import HighlightedText from "./postEdit/HighlightedText";
import { PostEditContainer } from "./postEdit/PostEditContainer";
import { ScoringContainer } from "./scoring/ScoringContainer";
import { useSpanEvalContext } from "./SpanEvalProvider";

const App: React.FC = () => {
  const {
    origText: referenceTranslation,
    setOrigText,
    translatedText: machineTranslation,
    setTranslatedText,
    originalSpans: originalHighlightedError,
    errorSpans: highlightedError,
    setErrorSpans,
    curEntryIdx,
    setEntryIdx,
    diffContent,
    setDiffContent,
  } = useSpanEvalContext();

  console.log(curEntryIdx);

  // *NOTE*
  // For now I want to CLEAR the translation contents on the screen.
  // It can be made into an option of it's own to LOAD in a translation from the backend.

  // const [diffContent, setDiffContent] =
  //   useState<React.ReactNode>(machineTranslation);

  const [error_spans, setErrorSpans_] = useState();

  const [isLoading, setIsLoading] = useState(false);
  const [displayedTranslation, setDisplayedTranslation] = useState(""); // Streaming effect state
  const [translation, setTranslation] = useState("");
  const [sourceTextInput, setSourceTextInput] = useState(
    // "Kuwa mbere, abahanga ba siyansi bo mu Ishuri rikuru ry’ubuvuzi rya kaminuza ya Stanford bataganje ko havumbuwe igikoresho gishya cyo gusuzuma gishobora gutandukanya ingirabuzima"
    null
  );

  const [sanitizedHtmlString, setSanitizedHtmlString] = useState(
    // "<span><span class='highlight' style='background-color: #00A0F0; padding: 0vh 0vw 0vh 0vw; zIndex: 0'>Student</span>s from Stanford University Medical School an<span class='highlight' style='background-color: #D3365A; padding: 1vh 0vw 1vh 0vw; zIndex: 1'>nounced Monday the invention of a new diag<span class='highlight' style='background-color: #59c00aba; padding: 2vh 0vw 2vh 0vw; zIndex: 2'>nostic tool tha</span></span>t can sort cells by type of small printed chip</span>"
    // "<span><span id='highlight-0' class='highlight' onMouseMove={handleMouseMove(event)} onMouseLeave={handleMouseLeave(event)} onMouseEnter={handleMouseEnter(event)} style='background-color: #00A0F0; padding: 0vh 0vw 0vh 0vw; zIndex: 0'>Student</span>s from Stanford University Medical School an<span id='highlight-1' class='highlight' onMouseMove={handleMouseMove(event)} onMouseLeave={handleMouseLeave(event)} onMouseEnter={handleMouseEnter(event)} style='background-color: #D3365A; padding: 1vh 0vw 1vh 0vw; zIndex: 1'>nounced Monday the invention of a new diag<span id='highlight-2' class='highlight' onMouseMove={handleMouseMove(event)} onMouseLeave={handleMouseLeave(event)} onMouseEnter={handleMouseEnter(event)} style='background-color: #59c00aba; padding: 2vh 0vw 2vh 0vw; zIndex: 2'>nostic tool tha</span></span>t can sort cells by type of small printed chip</span>"
    // "<span><span id='highlight-0' class='highlight' onMouseMove={handleMouseMove(event)} onMouseLeave={handleMouseLeave(event)} onMouseEnter={handleMouseEnter(event)} style='background-color: #FF5733; padding: 0vh 0vw 0vh 0vw; zIndex: 0'>Students from Stanfo</span>rd University Medical School announced Monday the invention of a new diagnostic tool that can sort cells by type of small printed chip</span>"
    "<span class='machine--translation'; contentEditable= 'true'; onblur='handleBlur(event, 0)';>因为他们不想看到你<span class='highlight' id='highlight-0' style='background-color: #800080; padding: 0vh 0vw 0vh 0vw; zIndex: 0'; contentEditable= 'true'; onblur='handleBlur(event, 0)';>赢得比赛</span>.</span>"
  );

  const [highlightedErrors, setHighlightedError] = useState<any>([
    {
      original_text: "赢得比赛",
      translated_text: "win the game",
      correct_text: "win the match",
      start_index_orig: 9,
      end_index_orig: 13,
      start_index_translation: 9,
      end_index_translation: 13,
      error_type: "Hallucinations",
    },
  ]);

  // Streaming animation effect
  useEffect(() => {
    if (referenceTranslation) {
      let currentIndex = 0;
      const intervalId = setInterval(() => {
        if (currentIndex < referenceTranslation.length) {
          setDisplayedTranslation(
            (prev) => prev + referenceTranslation[currentIndex]
          );
          currentIndex++;
        } else {
          clearInterval(intervalId); // Stop when the animation is complete
        }
      }, 50); // Adjust delay for typing speed
      return () => clearInterval(intervalId);
    } else {
      setDisplayedTranslation(""); // Clear text when translation resets
    }
  }, [referenceTranslation]);

  const handleDiffTextUpdate = (parsedDiff: React.ReactNode) => {
    setDiffContent(parsedDiff);
  };
  const handleInputBoxChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const userInput = e.currentTarget.value;
    setSourceTextInput(userInput);
  };

  const handleSubmission = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setIsLoading(true);
    setOrigText(sourceTextInput);
    sendTranslation(sourceTextInput);
    setErrorSpans([]);
  };

  const sendTranslation = async (userInput: string) => {
    try {
      const response = await fetch(
        // "http://127.0.0.1:63030/submit_translation",
        // "http://127.0.0.1:64000/submit_translation",
        "https://supreme-tortoise-steadily.ngrok-free.app", // Ngrok URL on serving desktop
        // "https://43fb-99-232-136-159.ngrok-free.app/submit_translation", // Ngrok URL
        {
          method: "POST",
          headers: {
            "ngrok-skip-browser-warning": "true", // Bypass ngrok browser warning
            "Content-Type": "application/json; charset=UTF-8", // Need UTF-8 encoding
          },
          body: JSON.stringify({ value: userInput, translation: "" }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setIsLoading(false);
      setTranslation(data.response);

      setTranslatedText(data.response);
      setDiffContent(data.response);

      console.log(data.highlights);
      const sanitized = DOMPurify.sanitize(data.highlights);
      setSanitizedHtmlString(sanitized);

      // Start Generating Spans Asynchronously
      fetch_generated_spans(userInput, data.response);
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
  };

  const fetch_generated_spans = async (
    userInput: string,
    translation: string
  ) => {
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(
          // "http://127.0.0.1:63030/fetch_error_spans",
          // "http://127.0.0.1:64000/fetch_error_spans",
          "https://supreme-tortoise-steadily.ngrok-free.app", // Ngrok URL on serving desktop
          // "https://43fb-99-232-136-159.ngrok-free.app/fetch_error_spans", // Ngrok URL
          {
            method: "POST",
            headers: {
              "ngrok-skip-browser-warning": "true", // Bypass ngrok browser warning
              "Content-Type": "application/json; charset=UTF-8", // Need UTF-8 encoding
            },
            body: JSON.stringify({
              value: userInput,
              translation: translation,
            }), // Correctly format the payload
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setErrorSpans_(data.error_spans);

        if (Object.keys(data.error_spans).length > 0) {
          clearInterval(intervalId); // Stop polling once the data is available
          // console.log("Secondary operation result:", data.error_spans);
          // Process the result of the secondary operation

          // console.log(data.highlights);
          // console.log(data.error_spans.errorSpans);
          const sanitized = DOMPurify.sanitize(data.highlights);
          setSanitizedHtmlString(sanitized);
          setHighlightedError(data.error_spans.errorSpans);
          // console.log(data.error_spans.errorSpans);
          setErrorSpans(data.error_spans.errorSpans);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }, 2500); // Poll every 2 seconds, adjust interval as needed
  };

  // **JSX**
  return (
    <div className="body">
      <div className="application_wrapper">
        <img className="logo_1" src={logo} alt="" />
        <div className="wrapper">
          <div className="input-and-button">
            <div className="input-container">
              <ul className="language-bar">
                <li className="from-languages">
                  <select>
                    <option value="en-US">English</option>
                    <option value="hi-IN">Hindi</option>
                    <option value="ne-NP">Nepali</option>
                  </select>
                </li>
                <li className="to-languages">
                  <select>
                    <option value="zh-TW">Chinese (Simplified)</option>
                    <option value="en-US">English</option>
                    <option value="hi-IN">Hindi</option>
                    <option value="ne-NP">Nepali</option>
                  </select>
                </li>
              </ul>
              <div className="text-input">
                <textarea
                  className="from-text"
                  onChange={handleInputBoxChange}
                  placeholder="Type to translate"
                ></textarea>
                <div className="to-text-container">
                  <textarea
                    className={`to-text ${
                      isLoading ? "loading-icon-hidden" : ""
                    }`}
                    value={translation}
                    placeholder="Translated text appears here"
                    readOnly
                    disabled
                  ></textarea>
                  <img
                    className={`loading-icon ${
                      isLoading ? "" : "loading-icon-hidden"
                    }`}
                    src={loadingIconWhite}
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="translate-text-button">
            <button onClick={handleSubmission}>Translate Text</button>
          </div>
        </div>
        <div className="divider"></div>
        <h3>Source</h3>
        <div>
          <HighlightedText
            // text={referenceTranslation}
            text={referenceTranslation}
            // text={machineTranslation}
            highlights={highlightedError!}
            highlightKey="end_index_orig"
            disableEdit={true}
          />
        </div>
        <br />
        <br />
        <h3>Machine Translation</h3>
        <div>
          <div className="machine-translation-output">
            {diffContent && (
              <HighlightedText
                text={diffContent}
                // text={machineTranslation}
                highlights={highlightedError!}
                highlightKey="end_index_translation"
                disableEdit={true}
              />
            )}
          </div>
        </div>
        <div className="divider"></div>
        <PostEditContainer
          machineTranslation={machineTranslation}
          highlightedError={highlightedError!}
          onDiffTextUpdate={handleDiffTextUpdate}
        />

        {/* Scoring Section */}
        <ScoringContainer />

        <div className="accept-translation-section">
          <button onClick={() => setEntryIdx(curEntryIdx + 1)}>
            Submit Annotation
          </button>
        </div>
        <div className="divider"></div>
        <div>
          <button
            className="restart_entry_button"
            onClick={() => setEntryIdx(0)}
          >
            Restart to entry #0
          </button>
        </div>

        <div className="send-feedback">
          <a>Send Feedback</a>
        </div>
      </div>
    </div>
  );
};

export default App;
