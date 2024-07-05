import React, { useState, useRef } from "react";
// import loadingIconGrey from './assets/loading_icon_grey.svg';
import loadingIconWhite from "./assets/loading_icon_white.svg";
// import parse from 'html-react-parser';
import DOMPurify from "dompurify";
import "./App.css";
import "./index.css";

interface ApiResponse {
  received_string: string;
  response: string;
  spans: {
    errors: ErrorType[];
  };
  highlights: string;
}

interface ErrorType {
  original_text: string;
  translated_text: string;
  correct_text: string;
  start_index_orig: number;
  end_index_orig: number;
  start_index_translation: number;
  end_index_translation: number;
  error_type: string;
}

const App: React.FC = () => {
  const sourceTextRef = useRef(null);
  const translationTextRef = useRef<HTMLDivElement | null>(null);

  const [sanitizedHtmlString, setSanitizedHtmlString] = useState(
    "<span><span class='highlight' style='background-color: #00A0F0; padding: 0vh 0vw 0vh 0vw; zIndex: 0'>Student</span>s from Stanford University Medical School an<span class='highlight' style='background-color: #D3365A; padding: 1vh 0vw 1vh 0vw; zIndex: 1'>nounced Monday the invention of a new diag<span class='highlight' style='background-color: #59c00aba; padding: 2vh 0vw 2vh 0vw; zIndex: 2'>nostic tool tha</span></span>t can sort cells by type of small printed chip</span>"
  );

  const [sourceTextInput, setSourceTextInput] = useState(
    "Kuwa mbere, abahanga ba siyansi bo mu Ishuri rikuru ry’ubuvuzi rya kaminuza ya Stanford bataganje ko havumbuwe igikoresho gishya cyo gusuzuma gishobora gutandukanya ingirabuzima"
  );
  const [translation, setTranslation] = useState("");
  const [error_type, setErrorType] = useState("Incorrect Subject");
  const [errorLegend, setErrorLegend] = useState<{ error_type: string, color: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [popupStyle, setPopupStyle] = useState({
    top: 0,
    left: 0,
    display: "none",
  });

  const [translationSubmitted, setTranslationSubmitted] = useState(false); // Track if translation has been submitted

  const errorColors: { [key: string]: string } = {
    "Incorrect Subject": "#113c6a",
    "Omission": "#2CF551",
    "Incomplete Sentence": "#A5304C",
  };

  const handleInputBoxChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const userInput = e.currentTarget.value;
    setSourceTextInput(userInput);
  };

  const handleSubmission = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    sendTranslation(sourceTextInput);
    setIsLoading(true);
  };

  const sendTranslation = async (userInput: string) => {
    try {
      const response = await fetch(
        "http://127.0.0.1:63030/submit_translation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ value: userInput }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      setIsLoading(false);
      setTranslation(data.response);

      console.log(data.highlights);
      const sanitized = DOMPurify.sanitize(data.highlights);
      setSanitizedHtmlString(sanitized);

      const uniqueErrors = Array.from(new Set(data.spans.errors.map((error: ErrorType) => error.error_type)));
      const legendItems = uniqueErrors.map((error_type: string) => ({
        error_type,
        color: errorColors[error_type] || "#FFFFFF",
      }));

      setErrorLegend(legendItems);
      setTranslationSubmitted(true); // Set translation submitted flag to true
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
  };

  const handleMouseEnter = (event: React.MouseEvent) => {
    console.log("ENTERED");
    setPopupStyle({
      top: event.clientY + 30,
      left: event.clientX - 150,
      display: "block",
    });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    // console.log("MOVING", event.clientX, event.clientY);
    setPopupStyle({
      top: event.clientY + 375,
      left: event.clientX - 150,
      display: "block",
    });
  };

  const handleMouseLeave = () => {
    console.log("LEFT");
    setPopupStyle({ ...popupStyle, display: "none" });
  };

  return (
    <div className="landing-page-parent">
      <div className="navbar">
        <ul className="navbar-contents">
          <li className="navbar-item">
            <img className="logo" src="favicon.svg" alt="" />
            <a className="navbar-item-name" href="http://localhost:5173">
              Translation Error
            </a>
          </li>
        </ul>
      </div>
      <div className="input-and-button">
        <div className="input-container">
          <div className="wrapper">
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
                  <option value="zh-TW">Chinese (Traditional)</option>
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

      {/* Error Highlighting Section */}
      <div className="error-highlighting-section">
        <hr className="divider" />
        <div className="source-text-highlighting">
          <h2 className="source-text-title">Original Text</h2>
          <p ref={sourceTextRef}>{sourceTextInput}</p>
        </div>

        <hr className="divider" />
        <h2 className="source-text-title">Translation Text</h2>

        <div
          className="highlight-container"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
          dangerouslySetInnerHTML={{ __html: sanitizedHtmlString }}
        />

        <div className="error-tooltip-container" style={popupStyle}>
          <div className="error-tooltip">
            <h3>Error Type:</h3>
            <h3 style={{ color: "#00A0F0" }}> {error_type}</h3>
            <p>Additional Details... TBD</p>
          </div>
        </div>
        
        {translationSubmitted && (
          <>
            <hr className="divider" />
            <div className="error-legend-section">
              <ul>
                {errorLegend.map((legend, index) => (
                  <li key={index}>
                    <div
                      className="color-label"
                      style={{ backgroundColor: legend.color }}
                    ></div>
                    <p>{legend.error_type}</p>
                  </li>
                ))}
              </ul>
            </div>
          </> 
        )}
        <hr className="divider" />
      </div>

      {/* Edit Context Section */}

      <div className="edit-context-section">
        <h2 className="">Edit Context</h2>
        <div className="suggestion-section">
          This is a suggestion for “extra details”, provided by Option 2. The
          user can also choose Custom and enter their own text.
        </div>
        <hr className="divider" />
      </div>

      {/* Rephrase Section */}
      <div className="rephrase-section">
        <h2 className="">Rephrase</h2>
        <button>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit
          asperiores doloremque voluptatem voluptas blanditiis sequi, maxime ab
          ad minima quae!
        </button>
        <button>Lorem, ipsum dolor sit adipisicing elit. Ut, sit.</button>
        <button>Lorem, ipsum Ut, sit.</button>
        <hr className="divider" />
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
