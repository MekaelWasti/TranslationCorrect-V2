export interface HighlightedError {
  original_text: string;
  translated_text: string;
  correct_text: string;
  start_index_orig: number;
  end_index_orig: number;
  start_index_translation: number;
  end_index_translation: number;
  error_type: string;
}

export const colorMappings: { [key: string]: string } = {
  "Addition of Text": "#FF5733",
  "Negation Errors": "#00A0F0",
  "Mask In-filling": "#59c00a",
  "Named Entity (NE) Errors": "#D3365A",
  "Number (NUM) Errors": "#8B4513",
  "Hallucinations": "#800080",
  "No Error": "#2f3472"
};
