import React from "react";
import "../../index.css";
import { useSpanEvalContext } from "../SpanEvalProvider";

// **ScoringContainer Component**
export const SpanScoreSlider: React.FC = () => {
  // **Functions**
  const { selectedSpanIdx, spanScores, setSpanScores } = useSpanEvalContext();
  const handleSpanScoreChange = (index: number, score: number) => {
    setSpanScores!((prevScores) => ({ ...prevScores, [index]: score }));
  };

  //   Return JSX
  return (
    <div className="span-score-section">
      {/* TODO: Update title */}
      <h3>{selectedSpanIdx} Span Score</h3>
      <div className="slider-section">
        <h4>0</h4>
        <input
          className="span-slider"
          type="range"
          min="0"
          max="100"
          value={
            selectedSpanIdx != undefined
              ? spanScores[selectedSpanIdx] || 50
              : 50
          }
          onChange={(e) =>
            selectedSpanIdx != undefined
              ? handleSpanScoreChange(selectedSpanIdx, Number(e.target.value))
              : alert("Please select a span to score")
          }
        />
        <h4>100</h4>
      </div>
      <p>
        Score:{" "}
        {selectedSpanIdx != undefined ? spanScores[selectedSpanIdx] || 50 : 50}
      </p>
    </div>
  );
};
