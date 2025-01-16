import React from "react";
import "../../index.css";
import { SpanScoreSlider } from "./SpanScoreSlider";
import { SpanScoreDropdown } from "./SpanScoreDropdown";
import { OverallScoreSlider } from "./OverallScoreSlider";
import { useSpanEvalContext } from "../SpanEvalProvider";

// **ScoringContainer Component**
export const ScoringContainer: React.FC = () => {
  const { spanScores } = useSpanEvalContext();
  //   Return JSX
  return (
    <div className="scoring-section">
      <div className="sliders-row">
        {/* <SpanScoreSlider /> */}
        <SpanScoreDropdown />
        <div className="divider"></div>
        <OverallScoreSlider />
      </div>
      {/* Displaying All Span Scores */}
      <div className="span-scores-display">
        <h3>All Span Scores</h3>
        {Object.entries(spanScores).map(([index, score]) => (
          <p key={index}>
            Span {index}: {score}
          </p>
        ))}
      </div>
    </div>
  );
};
