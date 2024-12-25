import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";

import { HighlightedError } from "../types";
import inputJson from "../static/input_sample.json";

// Provides context to components responsible for evaluating / editing translations.
// Currently only stores selected span index and span scores. Down the road, the provider can be used to track all evaluation/edit status.

type SpanEvalContextType = {
  curEntryIdx: number;
  setEntryIdx: (newEntryIdx: number) => void;
  origText: string;
  setOrigText: Dispatch<SetStateAction<string>>;
  translatedText: string;
  setTranslatedText: Dispatch<SetStateAction<string>>;
  originalSpans: HighlightedError[] | undefined;
  errorSpans: HighlightedError[] | undefined;
  setErrorSpans: Dispatch<SetStateAction<HighlightedError[] | undefined>>;
  updateSpanErrorType: (idx: number, newType: string) => void;
  addNewErrorSpan: (
    startTextIdx: number,
    endTextIdx: number,
    type: string
  ) => void;
  selectedSpanIdx: number | undefined;
  setSelectedSpanIdx: Dispatch<SetStateAction<number | undefined>>;
  diffContent: React.ReactNode;
  setDiffContent: Dispatch<SetStateAction<React.ReactNode>>;
  spanScores: { [key: number]: number };
  setSpanScores:
    | Dispatch<SetStateAction<{ [key: number]: number }>>
    | undefined;
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

  console.log(input);
  console.log(curEntryIdx);

  // const origText = input[curEntryIdx].original_text;
  // const [origText, setOrigText] = useState<string>(
  //   input[curEntryIdx].original_text
  // );
  // const [translatedText, setTranslatedText] = useState<string>(
  //   input[curEntryIdx].translated_text
  // );
  // const originalSpans = input[curEntryIdx].errorSpans;
  // const [errorSpans, setErrorSpans] = useState<HighlightedError[]>(
  //   input[curEntryIdx].errorSpans
  // );
  // const [diffContent, setDiffContent] =
  //   useState<React.ReactNode>(translatedText);

  // FOR NOW SETTING CLEARING INITIAL VALUE
  // FOR NOW SETTING CLEARING INITIAL VALUE
  // This system of loading the states from inputs or database should be if the user decides to through a button click
  const [origText, setOrigText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");
  const originalSpans = input[curEntryIdx].errorSpans;
  const [errorSpans, setErrorSpans] = useState<HighlightedError[]>([]);
  const [diffContent, setDiffContent] = useState<React.ReactNode>("");

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

  useEffect(() => {
    setSpanScores(spanScores);
  }, [spanScores]);

  // Updated context value with setters for origText, translatedText, and errorSpans
  const contextValue = {
    curEntryIdx,
    setEntryIdx,
    origText,
    setOrigText, // Add setter for origText
    translatedText,
    setTranslatedText, // Add setter for translatedText
    originalSpans,
    errorSpans,
    setErrorSpans, // Add setter for errorSpans
    updateSpanErrorType,
    addNewErrorSpan,
    diffContent,
    setDiffContent,
    selectedSpanIdx,
    setSelectedSpanIdx,
    spanScores,
    setSpanScores,
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
