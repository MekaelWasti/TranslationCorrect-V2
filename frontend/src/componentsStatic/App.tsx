import React, { useState } from "react";
import "../index.css";
import HighlightedText from "./postEdit/HighlightedText";
import { PostEditContainer } from "./postEdit/PostEditContainer";
import { ScoringContainer } from "./scoring/ScoringContainer";
import { useSpanEvalContext } from "./SpanEvalProvider";
import { Riple } from "react-loading-indicators";

const App: React.FC = () => {
  const {
    origText: referenceTranslation,
    translatedText: machineTranslation,
    originalSpans: originalHighlightedError,
    errorSpans: highlightedError,
    curEntryIdx,
    setEntryIdx,
    diffContent,
    setDiffContent,
  } = useSpanEvalContext();

  console.log(curEntryIdx);

  const handleDiffTextUpdate = (parsedDiff: React.ReactNode) => {
    setDiffContent(parsedDiff);
  };

  const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const [refreshed, setRefreshed] = useState<boolean>(true);

  const [translation, setTranslation] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLLMLoading, setIsLLMLoading] = useState<boolean>(false);

  const handleSubmission = async () => {
    setRefreshed(false);
    setIsLLMLoading(true);
    setIsLoading(true);
    await sleep(3000);
    setTranslation(
      "自从转会到加泰罗尼亚的首府球队，维达尔已经为俱乐部踢了 49 场比赛。"
    );
    setIsLoading(false);
    await sleep(3000);
    setIsLLMLoading(false);
  };

  // await sleep(3000);

  // **JSX**
  return (
    <div className="body">
      <h2>Test Env</h2>
      <p>Entry #{curEntryIdx}</p>
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
                // onChange={handleInputBoxChange}
                placeholder="Type to translate"
                value={
                  "Since moving to the Catalan-capital, Vidal had played 49 games for the club."
                }
              ></textarea>
              <div className="to-text-container">
                {isLoading ? (
                  <Riple color="#266CA9" size="small" text="" textColor="" />
                ) : (
                  <textarea
                    value={translation}
                    placeholder="Translated text appears here"
                    readOnly
                    disabled
                  ></textarea>
                )}
                <img
                  // className={`loading-icon ${
                  //   isLoading ? "" : "loading-icon-hidden"
                  // }`}
                  // src={loadingIconWhite}
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

      {refreshed ? (
        <div className="message-div">
          <br />
          <h2 className="message">
            Please enter translation input and click 'Translate Text'.
          </h2>
          {/* <div className="divider"></div> */}
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
        </div>
      ) : isLLMLoading ? (
        <div className="message-div">
          <Riple color="#266CA9" size="small" text="" textColor="" />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
        </div>
      ) : (
        <div>
          <h3>Source</h3>
          <div>
            <HighlightedText
              text={referenceTranslation}
              // text={machineTranslation}
              highlights={originalHighlightedError!}
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
                  highlights={originalHighlightedError!}
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
        </div>
      )}
      <div>
        <button onClick={() => setEntryIdx(0)}>Restart to entry #0</button>
      </div>
      <div className="send-feedback">
        <a>Send Feedback</a>
      </div>
    </div>
  );
};

export default App;
