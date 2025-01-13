import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";

import { HighlightedError } from "../types";
// import inputJson from "../static/input_sample.json";
import inputJson from "../static/input.json";

// Provides context to components responsible for evaluating / editing translations.
// Currently only stores selected span index and span scores. Down the road, the provider can be used to track all evaluation/edit status.

type SpanEvalContextType = {
  curEntryIdx: number;
  setEntryIdx: (newEntryIdx: number) => void;
  origText: string;
  translatedText: string;
  originalSpans: HighlightedError[] | undefined;
  errorSpans: HighlightedError[] | undefined;
  updateSpanErrorType: (idx: number, newType: string) => void;
  addNewErrorSpan: (
    startTextIdx: number,
    endTextIdx: number,
    type: string
  ) => void;
  selectedSpanIdx: number | undefined;
  setSelectedSpanIdx: Dispatch<SetStateAction<number | undefined>>;
  diffContent: React.ReactNode;
  setEdits: Dispatch<SetStateAction<[]>>;
  setDiffContent: Dispatch<SetStateAction<React.ReactNode>>;
  spanScores: { [key: number]: number };
  setSpanScores: Dispatch<SetStateAction<{ [key: number]: number }>>;
  overallScore: number | undefined;
  setOverallScore: Dispatch<SetStateAction<number | undefined>>;
  submitAnnotations: () => void;
};

const SpanEvalContext = createContext<SpanEvalContextType | undefined>(
  undefined
);

type SpanEvalProviderProps = { children: React.ReactNode };

export const SpanEvalProvider = ({ children }: SpanEvalProviderProps) => {
  const [curEntryIdx, setCurEntryIdx] = useState<number>(
    Number(localStorage.getItem("curEntryIdx")) || 0
  );
  const input = inputJson.input;

  // const origText = input[curEntryIdx].original_text;
  const [origText, setOrigText] = useState<string>(
    input[curEntryIdx].original_text
  );
  const [translatedText, setTranslatedText] = useState<string>(
    input[curEntryIdx].translated_text
  );
  const originalSpans = input[curEntryIdx].errorSpans;
  const [errorSpans, setErrorSpans] = useState<HighlightedError[]>(
    input[curEntryIdx].errorSpans
  );
  const [diffContent, setDiffContent] =
    useState<React.ReactNode>(translatedText);
  const [edits, setEdits] = useState<[]>([]);

  const setEntryIdx = (newEntryIdx: number) => {
    if (newEntryIdx >= input.length) {
      return;
    }
    setCurEntryIdx(newEntryIdx);
    setOrigText(input[newEntryIdx].original_text);
    setTranslatedText(input[newEntryIdx].translated_text);
    setErrorSpans(input[newEntryIdx].errorSpans);
    setDiffContent(input[newEntryIdx].translated_text);
    localStorage.setItem("curEntryIdx", `${newEntryIdx}`);
  };
  const updateSpanErrorType = (idx: number, newType: string) => {
    const newErrorSpan = { ...errorSpans[idx], error_type: newType };
    const newErrorSpans = [
      ...errorSpans.slice(0, idx),
      newErrorSpan,
      ...errorSpans.slice(idx + 1, errorSpans.length),
    ];

    setErrorSpans(newErrorSpans);
  };
  const addNewErrorSpan = (
    startTextIdx: number,
    endTextIdx: number,
    type: string
  ) => {
    const newErrorSpans = [
      ...errorSpans,
      {
        start_index_translation: startTextIdx,
        end_index_translation: endTextIdx,
        error_type: type,
      } as HighlightedError,
    ];
    setErrorSpans(newErrorSpans);
  };

  const [selectedSpanIdx, setSelectedSpanIdx] = useState<number>();
  const [spanScores, setSpanScores] = useState<{
    [key: number]: number;
  }>({}); // span idx: score

  const [overallScore, setOverallScore] = useState<number | undefined>();
  const submitAnnotations = () => {
    fetch(
      "https://307od668g8.execute-api.us-east-1.amazonaws.com/default/submitUserAnnotations",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          original: origText,
          translated: translatedText,
          edits: edits,
          error_spans: errorSpans,
          span_scores: spanScores,
          overall_score: overallScore,
        }),
      }
    );
  };

  useEffect(() => {
    setSpanScores(spanScores);
  }, [spanScores]);

  const contextValue = {
    curEntryIdx,
    setEntryIdx,
    origText,
    translatedText,
    originalSpans,
    errorSpans,
    updateSpanErrorType,
    addNewErrorSpan,
    diffContent,
    setDiffContent,
    edits,
    setEdits,
    selectedSpanIdx,
    setSelectedSpanIdx,
    spanScores,
    setSpanScores,
    overallScore,
    setOverallScore,
    submitAnnotations,
  };

  return (
    <SpanEvalContext.Provider value={contextValue}>
      {children}
    </SpanEvalContext.Provider>
  );
};

export const useSpanEvalContext = () => {
  const value = useContext(SpanEvalContext);

  if (!value) {
    throw new Error("Tried to consume SpanEvalContext without a provider");
  }

  return value;
};
