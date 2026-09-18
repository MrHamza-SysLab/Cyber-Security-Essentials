/** Shared helper — pick Urdu overlay or English fallback. */
export function pick(isUr, urValue, enValue) {
  return isUr && urValue != null ? urValue : enValue
}

/** Map array of English lines to Urdu lines when available. */
export function pickLines(isUr, urLines, enLines) {
  return isUr && Array.isArray(urLines) && urLines.length ? urLines : enLines
}
