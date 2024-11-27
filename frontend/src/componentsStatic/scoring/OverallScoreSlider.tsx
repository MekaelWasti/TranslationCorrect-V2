import React from "react";
import "../../index.css";
import { useSpanEvalContext } from "../SpanEvalProvider";

// **ScoringContainer Component**
export const OverallScoreSlider: React.FC = () => {
  const { overallScore, setOverallScore } = useSpanEvalContext();
  // **Functions**
  const handleOverallScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOverallScore(Number(e.target.value));
  };

  //   Return JSX
  return (
    <div className="overall-score-section">
      <h3>Overall Translation Score</h3>
      <div className="slider-section">
        <h4>0</h4>
        <input
          className="span-slider"
          type="range"
          min="0"
          max="100"
          value={overallScore ?? 50}
          onChange={handleOverallScoreChange}
        />
        <h4>100</h4>
      </div>
      <p>Score: {overallScore}</p>
    </div>
  );
};
