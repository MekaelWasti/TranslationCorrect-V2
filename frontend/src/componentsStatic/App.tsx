import React from "react";
import "../index.css";
import { HighlightedError } from "../types";
import { SpanEvalProvider } from "./SpanEvalProvider";
import HighlightedText from "./postEdit/HighlightedText";
import { PostEditContainer } from "./postEdit/PostEditContainer";
import { ScoringContainer } from "./scoring/ScoringContainer";

const App: React.FC = () => {
  // **States**

  const referenceTranslation =
    "斯坦福大学医学院的学生周一宣布发明了一种新的诊断工具，可以按微型印刷芯片的形式对细胞进行分类.";

  const machineTranslation =
    "Students from Stanford University Medical School announced Monday the invention of a new diagnostic tool that can sort cells by type, in the form of a miniature printed chip";

  const highlightedError: HighlightedError[] = [
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
      // error_type: "Hallucinations",
    },
    {
      original_text: "赢得比赛",
      translated_text: "win the game",
      correct_text: "win the match",
      start_index_orig: 15,
      end_index_orig: 20,
      start_index_translation: 49,
      end_index_translation: 65,
      error_type: "Addition of Text",
      // error_type: "Hallucinations",
    },
  ];

  // **JSX**
  return (
    <div className="body">
      <h2>Test Env</h2>
      <div className="divider"></div>
      <SpanEvalProvider>
        <h3>Source</h3>
        <div>
          <HighlightedText
            text={referenceTranslation}
            highlights={highlightedError}
            highlightKey="end_index_orig"
            disableEdit={true}
          />
        </div>
        <br />
        <br />
        <h3>Machine Translation</h3>
        <div>
          <HighlightedText
            text={machineTranslation}
            highlights={highlightedError}
            highlightKey="end_index_translation"
            disableEdit={true}
          />
        </div>
        <div className="divider"></div>
        <PostEditContainer
          machineTranslation={machineTranslation}
          highlightedError={highlightedError}
        />

        {/* Scoring Section */}
        <ScoringContainer />

        <div className="accept-translation-section">
          <button>Submit Annotation</button>
        </div>
      </SpanEvalProvider>

      <div className="send-feedback">
        <a>Send Feedback</a>
      </div>
    </div>
  );
};

export default App;
