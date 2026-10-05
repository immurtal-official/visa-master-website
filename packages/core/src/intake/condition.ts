import { readAnswer } from "./answers";

/**
 * A condition on the answers, written as data.
 *
 * The document checklist uses these to say when a document is needed, and
 * branching questions will use the same shape to say when a question is
 * asked. Written as data rather than as a function, a condition can be read
 * back: the questionnaire gate checks that every answer it names exists, is a
 * choice, and can actually take each value it compares against. A function
 * comparing bare strings could not be checked, and renaming an option made the
 * condition silently never true.
 *
 *   { answer: "companions.whoPays", is: "employer" }
 *   { answer: "companions.whoPays", in: ["family", "employer"] }
 *   { all: [ …conditions ] }   every one holds
 *   { any: [ …conditions ] }   at least one holds
 *   { not: condition }
 *
 * `answer` is the answer path, as questionnaire.ts stores it.
 */
export type Condition =
  | { answer: string; is: string }
  | { answer: string; in: readonly string[] }
  | { all: readonly Condition[] }
  | { any: readonly Condition[] }
  | { not: Condition };

/** Whether the condition holds for these answers. An unanswered question holds no value. */
export function conditionHolds(condition: Condition, answers: unknown): boolean {
  if ("all" in condition) return condition.all.every((c) => conditionHolds(c, answers));
  if ("any" in condition) return condition.any.some((c) => conditionHolds(c, answers));
  if ("not" in condition) return !conditionHolds(condition.not, answers);

  const value = readAnswer(answers, condition.answer);
  if (typeof value !== "string") return false;
  return "is" in condition ? value === condition.is : condition.in.includes(value);
}

/** Every comparison inside a condition, for checking them against the questionnaire. */
export function comparisonsOf(
  condition: Condition,
): { answer: string; values: readonly string[] }[] {
  if ("all" in condition) return condition.all.flatMap(comparisonsOf);
  if ("any" in condition) return condition.any.flatMap(comparisonsOf);
  if ("not" in condition) return comparisonsOf(condition.not);
  return [{ answer: condition.answer, values: "is" in condition ? [condition.is] : condition.in }];
}
