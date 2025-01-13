import React from "react";
import "../index.css";
import HighlightedText from "./postEdit/HighlightedText";
import { PostEditContainer } from "./postEdit/PostEditContainer";
import { ScoringContainer } from "./scoring/ScoringContainer";
import { useSpanEvalContext } from "./SpanEvalProvider";

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
    submitAnnotations,
  } = useSpanEvalContext();

  console.log(curEntryIdx);

  // const [diffContent, setDiffContent] =
  //   useState<React.ReactNode>(machineTranslation);

  const handleDiffTextUpdate = (parsedDiff: React.ReactNode) => {
    setDiffContent(parsedDiff);
  };

  // **JSX**
  return (
    <div className="body">
      <h2>Test Env</h2>
      <p>Entry #{curEntryIdx}</p>
      <div className="divider"></div>
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
        <button
          onClick={async () => {
            submitAnnotations();
            setEntryIdx(curEntryIdx + 1);
          }}
        >
          Submit Annotation
        </button>
      </div>
      <div className="divider"></div>
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
