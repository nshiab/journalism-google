const warnedFunctions = new Set<string>();

export default function warnDeprecated(
  oldFunction: string,
  replacement: string,
  writeWarning: (message: string) => void = console.warn,
): void {
  if (warnedFunctions.has(oldFunction)) {
    return;
  }
  warnedFunctions.add(oldFunction);
  writeWarning(
    `[journalism-google] ${oldFunction}() is deprecated. Use ${replacement} instead. It may be removed in the next major release.`,
  );
}
