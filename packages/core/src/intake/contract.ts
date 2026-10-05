import {
  OPTION_GROUPS,
  QUESTIONNAIRE,
  answerPath,
  type QuestionDefinition,
  type SectionDefinition,
} from "./questionnaire";
import { ruleName } from "./rules";

/**
 * The intake contract: the part of the questionnaire something downstream
 * depends on.
 *
 * The documents the pack produces, the checklist's conditions and the
 * conductor's input all read core answers by path and expect each to mean what
 * it meant when they were written. So for every core question the contract
 * records where its answer lives, how it is given, which rule it must meet and,
 * for a choice, exactly which values it can take — plus which rules relate
 * answers to each other.
 *
 * What it leaves out is as deliberate: order, wording, keyboards and every
 * extra question. Those can change on any day without anything downstream
 * noticing, and the contract staying the same is what proves it.
 */

export interface ContractQuestion {
  path: string;
  kind: "text" | "date" | "choice";
  /** The registered name of its rule, for a text or date question. */
  rule?: string;
  /** The registered name of its stricter on-its-own rule, if it has one. */
  alone?: string;
  /** For a choice: the option set and the values it offers, in order. */
  options?: { group: string; values: string[] };
}

export interface IntakeContract {
  questions: ContractQuestion[];
  /** Rules relating answers, by section (or "form" for the whole form). */
  checks: { scope: string; check: string }[];
}

/** Stands in for a rule that is not one of the named rules in rules.ts. */
export const UNNAMED_RULE = "(not a named rule)";

type QuestionSection = Extract<SectionDefinition, { questions: QuestionDefinition[] }>;

function contractQuestion(sectionId: string, question: QuestionDefinition): ContractQuestion {
  const path = answerPath(sectionId, question);
  if (question.kind === "choice") {
    const values = (OPTION_GROUPS as Record<string, readonly string[]>)[question.options];
    return {
      path,
      kind: "choice",
      options: { group: String(question.options), values: [...(values ?? [])] },
    };
  }
  return {
    path,
    kind: question.kind ?? "text",
    rule: ruleName(question.rule) ?? UNNAMED_RULE,
    ...(question.alone !== undefined ? { alone: ruleName(question.alone) ?? UNNAMED_RULE } : {}),
  };
}

/** The contract the questionnaire currently declares. */
export function currentContract(): IntakeContract {
  const sections = (QUESTIONNAIRE.sections as SectionDefinition[]).filter(
    (section): section is QuestionSection => section.kind !== "review",
  );

  const questions = sections
    .flatMap((section) =>
      (section.questions ?? [])
        .filter((question) => !question.extra)
        .map((question) => contractQuestion(section.id, question)),
    )
    // Order is not part of the contract, so it is not allowed to look like it.
    .sort((a, b) => a.path.localeCompare(b.path));

  const checks = [
    ...sections
      .filter((section) => section.check)
      .map((section) => ({ scope: section.id, check: ruleName(section.check) ?? UNNAMED_RULE })),
    ...(QUESTIONNAIRE.check
      ? [{ scope: "form", check: ruleName(QUESTIONNAIRE.check) ?? UNNAMED_RULE }]
      : []),
  ].sort((a, b) => a.scope.localeCompare(b.scope));

  return { questions, checks };
}

/**
 * The contract as one canonical string — keys sorted at every level — so that
 * its checksum depends on what it says and never on how it was written out.
 * Hashing it needs node:crypto, which this module stays clear of because the
 * browser imports it; the lock script and the gate do the hashing.
 */
export function canonicalContract(contract: IntakeContract): string {
  const sortKeys = (value: unknown): unknown =>
    Array.isArray(value)
      ? value.map(sortKeys)
      : typeof value === "object" && value !== null
        ? Object.fromEntries(
            Object.keys(value)
              .sort()
              .map((key) => [key, sortKeys((value as Record<string, unknown>)[key])]),
          )
        : value;
  return JSON.stringify(sortKeys({ questions: contract.questions, checks: contract.checks }));
}

/** A comparable rendering of one contract question, for the messages. */
function describe(question: ContractQuestion): string {
  if (question.kind === "choice") {
    return `选择题，选项组 ${question.options!.group}：${question.options!.values.join(" / ")}`;
  }
  const kind = question.kind === "date" ? "日期题" : "文字题";
  return `${kind}，规则 ${question.rule}${question.alone ? `，单独作答时 ${question.alone}` : ""}`;
}

const pretty = (path: string) => path.replace(".", "/");

const ASK_AN_ENGINEER =
  "这一项属于作业契约：后面的材料生成、材料清单和 conductor 都按它读答案。\n" +
  "如果这个改动是有意的，请找工程师：确认下游都已跟上之后，" +
  "由工程师运行 `pnpm intake:lock --bump` 记录新的契约版本。";

/**
 * Every difference between the recorded contract and the current one, worded
 * for the person editing the questionnaire.
 */
export function contractDifferences(locked: IntakeContract, current: IntakeContract): string[] {
  const problems: string[] = [];
  const lockedByPath = new Map(locked.questions.map((q) => [q.path, q]));
  const currentByPath = new Map(current.questions.map((q) => [q.path, q]));

  for (const [path, before] of lockedByPath) {
    const now = currentByPath.get(path);
    if (!now) {
      problems.push(
        `作业契约里的题 \`${pretty(path)}\` 在 questionnaire.ts 里找不到了（被删掉、改了 id，或挪到了别的节）。\n` +
          `原来是：${describe(before)}。\n${ASK_AN_ENGINEER}`,
      );
      continue;
    }
    if (describe(now) !== describe(before)) {
      problems.push(
        `作业契约里的题 \`${pretty(path)}\` 被改了。\n` +
          `原来是：${describe(before)}\n现在是：${describe(now)}\n${ASK_AN_ENGINEER}`,
      );
    }
  }

  for (const [path] of currentByPath) {
    if (lockedByPath.has(path)) continue;
    problems.push(
      `\`${pretty(path)}\` 是一道新题，但没有标 extra: true，所以它会进入作业契约。\n` +
        `如果它只是补充信息（后面的材料不依赖它），请给它加上 extra: true 和一个 example（一个合格的示例答案）。\n` +
        `如果作业确实要用它，${ASK_AN_ENGINEER}`,
    );
  }

  const key = (c: { scope: string; check: string }) => `${c.scope}:${c.check}`;
  const lockedChecks = new Set(locked.checks.map(key));
  const currentChecks = new Set(current.checks.map(key));
  for (const check of locked.checks) {
    if (!currentChecks.has(key(check))) {
      problems.push(
        `「${check.scope}」${check.scope === "form" ? "（整张表）" : "这一节"}原来有一条关联规则 ${check.check}，现在没有了。\n` +
          ASK_AN_ENGINEER,
      );
    }
  }
  for (const check of current.checks) {
    if (!lockedChecks.has(key(check))) {
      problems.push(
        `「${check.scope}」${check.scope === "form" ? "（整张表）" : "这一节"}新加了一条关联规则 ${check.check}。\n` +
          ASK_AN_ENGINEER,
      );
    }
  }

  return problems;
}
