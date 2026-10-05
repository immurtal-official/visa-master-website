import {
  OPTION_GROUPS,
  QUESTIONNAIRE,
  type QuestionDefinition,
  type SectionDefinition,
} from "./questionnaire";
import { ruleName } from "./rules";
import { comparisonsOf, type Condition } from "./condition";

/**
 * Whether questionnaire.ts is written the way the rest of the system can read.
 *
 * TypeScript would catch most of this, but `pnpm check:intake` runs the tests,
 * not the type checker, and its reader is not necessarily an engineer. So the
 * mistakes a person editing the file by hand is most likely to make are
 * checked here as well, each with a sentence saying what to write instead.
 */

const FILE = "packages/core/src/intake/questionnaire.ts";

/** Ids appear in URLs, in JSON keys and in message keys: letters and digits only. */
const ID = /^[a-z][A-Za-z0-9]*$/;

const KINDS = new Set(["text", "date", "choice"]);

function isSchema(value: unknown): value is { safeParse(v: unknown): { success: boolean } } {
  return typeof (value as { safeParse?: unknown } | null)?.safeParse === "function";
}

function questionProblems(sectionId: string, question: QuestionDefinition): string[] {
  const problems: string[] = [];
  const name = `\`${sectionId}/${question.id}\``;
  const loose = question as unknown as Record<string, unknown>;

  if (typeof question.id !== "string" || !ID.test(question.id)) {
    problems.push(
      `${FILE} 的「${sectionId}」节里有一道题的 id 写成了 ${JSON.stringify(question.id)}。\n` +
        `id 只能用英文字母和数字、以小写字母开头，例如 "hotelName"。它会出现在网址和文案键名里。`,
    );
    return problems;
  }

  const kind = (loose.kind as string | undefined) ?? "text";
  if (!KINDS.has(kind)) {
    problems.push(
      `${name} 的 kind 写成了 ${JSON.stringify(loose.kind)}。\n` +
        `只能是 "text"（文字，默认，可以不写）、"date"（日期）或 "choice"（选择题）。`,
    );
    return problems;
  }

  if (kind === "choice") {
    const group = loose.options as string | undefined;
    if (!group) {
      problems.push(
        `${name} 是选择题，但没有写用哪一组选项。\n` +
          `请写 options: "<选项组名>"，现有的选项组：${Object.keys(OPTION_GROUPS).join("、")}。` +
          `也可以在 OPTION_GROUPS 里新建一组。`,
      );
    } else if (!(group in OPTION_GROUPS)) {
      problems.push(
        `${name} 用的选项组 "${group}" 不存在。\n` +
          `现有的选项组：${Object.keys(OPTION_GROUPS).join("、")}。拼写要完全一致；也可以在 OPTION_GROUPS 里新建这一组。`,
      );
    }
    if ("rule" in loose) {
      problems.push(`${name} 是选择题，选择题的规则就是它的选项，不需要写 rule，请删掉 rule。`);
    }
  } else {
    if (!isSchema(loose.rule)) {
      problems.push(
        `${name} 没有写 rule，或者 rule 写得不对。\n` +
          `请从 packages/core/src/intake/rules.ts 里选一条，例如 rule: text(1, 100) 表示 1 到 100 个字。`,
      );
    } else if (!question.extra && !ruleName(loose.rule)) {
      problems.push(
        `${name} 属于作业契约，它的 rule 必须是 rules.ts 里有名字的规则，不能在 questionnaire.ts 里现写。\n` +
          `如果需要新规则，请找工程师把它加进 rules.ts。`,
      );
    }
    if (loose.alone !== undefined && !isSchema(loose.alone)) {
      problems.push(
        `${name} 的 alone 写得不对。它必须是 rules.ts 里的一条规则；不需要的话请删掉。`,
      );
    }
    if ("options" in loose) {
      problems.push(
        `${name} 写了 options 却不是选择题。如果它是选择题，请写 kind: "choice"；否则请删掉 options。`,
      );
    }
  }

  if (question.extra) {
    // The job's input carries the work, never the account (AGENTS.md). An
    // extra answer travels in it, so an extra question may not ask for one.
    const keyboard = (loose.keyboard ?? {}) as { inputMode?: string; autoComplete?: string };
    if (keyboard.inputMode === "email" || /email/i.test(keyboard.autoComplete ?? "")) {
      problems.push(
        `${name} 看起来在问邮箱。补充题的答案会原样交给后台作业，而作业里不允许出现账号信息（邮箱、用户 id、登录凭证）。\n` +
          `请不要用补充题收集邮箱；需要联系方式的话，申请人的手机号已经在「关于申请人」里问过了。`,
      );
    }
    if (typeof question.example !== "string" || question.example === "") {
      problems.push(
        `${name} 是补充题（extra: true），需要写一个 example：一个合格的示例答案。\n` +
          `自动测试会用它来填这道题${kind === "choice" ? "，选择题请写其中一个选项的 id" : ""}。`,
      );
    } else if (kind === "choice") {
      const options = (OPTION_GROUPS as Record<string, readonly string[]>)[String(loose.options)];
      if (options && !options.includes(question.example)) {
        problems.push(
          `${name} 的 example "${question.example}" 不是它的选项之一。可选的是：${options.join("、")}。`,
        );
      }
    } else if (isSchema(loose.rule)) {
      const rules = [loose.rule, ...(isSchema(loose.alone) ? [loose.alone] : [])];
      if (
        rules.some(
          (rule) =>
            !(rule as { safeParse(v: unknown): { success: boolean } }).safeParse(question.example)
              .success,
        )
      ) {
        problems.push(
          `${name} 的 example "${question.example}" 通不过它自己的 rule。\n` +
            `请换一个合格的示例答案，或者检查 rule 是不是选对了。`,
        );
      }
    }
  }

  return problems;
}

/** A choice question that comes earlier in the form, by answer path. */
interface Earlier {
  extra: boolean;
  /** Undefined for a question that is not a choice. */
  options: readonly string[] | undefined;
  choice: boolean;
}

function isCondition(value: unknown): value is Condition {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  if (Array.isArray(c.all)) return c.all.every(isCondition);
  if (Array.isArray(c.any)) return c.any.every(isCondition);
  if ("not" in c) return isCondition(c.not);
  return (
    typeof c.answer === "string" &&
    (typeof c.is === "string" || (Array.isArray(c.in) && c.in.every((v) => typeof v === "string")))
  );
}

/**
 * Whether a showIf can be evaluated, and is about the right things: answers
 * to choice questions asked earlier — so the applicant has given them by the
 * time the question comes up, and no condition can depend on itself — with
 * values those questions can actually take. A condition that decides whether
 * a core question is asked may not depend on an extra question, which can
 * change on any day.
 */
function showIfProblems(
  where: string,
  showIf: unknown,
  earlier: Map<string, Earlier>,
  isCore: boolean,
): string[] {
  if (showIf === undefined) return [];
  if (!isCondition(showIf)) {
    return [
      `${where} 的 showIf 写法不对。\n` +
        `写法例如 { answer: "companions.whoPays", is: "family" }，或 { answer: "…", in: ["…", "…"] }；` +
        `也可以用 { all: [ … ] }、{ any: [ … ] }、{ not: … } 组合。`,
    ];
  }
  const problems: string[] = [];
  for (const { answer, values } of comparisonsOf(showIf)) {
    const target = earlier.get(answer);
    if (target && !target.choice) {
      problems.push(
        `${where} 的 showIf 用到了 "${answer}"，但它不是选择题。showIf 只能比较选择题的答案。`,
      );
      continue;
    }
    if (!target) {
      problems.push(
        `${where} 的 showIf 用到了 "${answer}"，但它前面没有这道选择题。\n` +
          `showIf 只能看排在它前面的选择题的答案（答案路径写成 "<节 id>.<题 id>"，补充题是 "extra.<节 id>.<题 id>"）。`,
      );
      continue;
    }
    if (isCore && target.extra) {
      problems.push(
        `${where} 属于作业契约，它是否被询问不能取决于补充题 "${answer}"。\n` +
          `请改用核心题；或者把这道题也设为补充题（extra: true）。`,
      );
    }
    for (const value of values) {
      if (target.options?.includes(value)) continue;
      problems.push(
        `${where} 的 showIf 比较的是 "${answer}" 等于 "${value}"，但那道题没有这个选项，条件永远不会成立。\n` +
          `它可选的是：${(target.options ?? []).join("、")}。`,
      );
    }
  }
  return problems;
}

/** Every way questionnaire.ts is written wrongly, in plain words. Empty when it is fine. */
export function declarationProblems(): string[] {
  const problems: string[] = [];
  const sections = QUESTIONNAIRE.sections as SectionDefinition[];

  // Choice questions seen so far, in form order, for checking showIf.
  const earlier = new Map<string, Earlier>();

  sections.forEach((section, index) => {
    const loose = section as unknown as Record<string, unknown>;
    if (typeof section.id !== "string" || !ID.test(section.id)) {
      problems.push(
        `${FILE} 里有一节的 id 写成了 ${JSON.stringify(section.id)}。\n` +
          `id 只能用英文字母和数字、以小写字母开头，例如 "accommodation"。`,
      );
      return;
    }
    if (section.id === "extra") {
      problems.push(
        `${FILE} 里有一节叫 "extra"。这个名字留给补充题存答案用，请给这一节换一个 id。`,
      );
    }

    if (section.kind === "review") {
      if (section.id !== "review" || index !== sections.length - 1) {
        problems.push(
          `「检查并提交」这一节必须叫 "review"，并且放在最后。现在它叫 "${section.id}"，在第 ${index + 1} 节。`,
        );
      }
      return;
    }

    if (!Array.isArray(loose.questions)) {
      problems.push(`「${section.id}」这一节没有写 questions: [ … ]。请在里面列出这一节的题。`);
      return;
    }
    const hasCore = section.questions.some((question) => !question.extra);
    problems.push(
      ...showIfProblems(`「${section.id}」这一节`, section.showIf, new Map(earlier), hasCore),
    );
    for (const question of section.questions) {
      problems.push(...questionProblems(section.id, question));
      problems.push(
        ...showIfProblems(
          `\`${section.id}/${question.id}\``,
          question.showIf,
          earlier,
          !question.extra,
        ),
      );
      const path = question.extra
        ? `extra.${section.id}.${question.id}`
        : `${section.id}.${question.id}`;
      earlier.set(path, {
        extra: Boolean(question.extra),
        choice: question.kind === "choice",
        options:
          question.kind === "choice"
            ? (OPTION_GROUPS as Record<string, readonly string[]>)[question.options]
            : undefined,
      });
    }
  });

  const reviews = sections.filter((section) => section.kind === "review");
  if (reviews.length !== 1) {
    problems.push(
      `${FILE} 里应该正好有一节「检查并提交」（{ id: "review", kind: "review" }），现在有 ${reviews.length} 节。`,
    );
  }

  return problems;
}
