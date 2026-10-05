/** The value stored at a dot-path in the answers, or undefined. */
export function readAnswer(answers: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => {
    if (typeof value !== "object" || value === null) return undefined;
    return (value as Record<string, unknown>)[key];
  }, answers);
}

/** Whether there is an answer at all: something other than nothing or an empty string. */
export function hasAnswer(answers: unknown, path: string): boolean {
  const value = readAnswer(answers, path);
  return value !== undefined && value !== null && value !== "";
}
