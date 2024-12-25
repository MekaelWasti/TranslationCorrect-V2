// src/types.ts

export interface Highlight {
  start: number;
  end: number;
  type: string;     // CSS class name
  priority: number; // Determines stacking order (higher means on top)
}
