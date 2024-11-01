export const mergeRanges = (
  ranges: { start: number; end: number; error_type: string }[]
) => {
  if (!ranges.length) return [];

  ranges.sort((a, b) => a.start - b.start); // sort by start time

  const result = [];
  let { start, end, error_type } = ranges[0];

  for (const range of ranges) {
    if (range.start <= end) {
      end = Math.max(end, range.end);
      if (range.end > end) error_type = range.error_type; // Update error type if necessary
    } else {
      result.push({ start, end, error_type });
      ({ start, end, error_type } = range);
    }
  }

  result.push({ start, end, error_type });

  return result;
};
