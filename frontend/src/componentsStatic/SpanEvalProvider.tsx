import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";

// Provides context to components responsible for evaluating / editing translations.
// Currently only stores selected span index. Down the road, the provider can be used to track all evaluation/edit status.

type SpanEvalContextType = {
  selectedSpanIdx: number | undefined;
  setSelectedSpanIdx: Dispatch<SetStateAction<number | undefined>>;
  spanScores: { [key: number]: number };
  setSpanScores: Dispatch<SetStateAction<{ [key: number]: number }>>;
};

const SpanEvalContext = createContext<SpanEvalContextType | undefined>(
  undefined
);

type SpanEvalProviderProps = { children: React.ReactNode };

export const SpanEvalProvider = ({ children }: SpanEvalProviderProps) => {
  const [selectedSpanIdx, setSelectedSpanIdx] = useState<number>();
  const [spanScores, setSpanScores] = useState<{ [key: number]: number }>({}); // span idx: score

  useEffect(() => {
    setSpanScores(spanScores);
  }, [spanScores]);

  const contextValue = {
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
