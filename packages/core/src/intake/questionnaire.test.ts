/**
 * The questionnaire gate.
 *
 * A question is described in several places at once: its place in
 * INTAKE_SECTIONS, its keyboard in FIELD_BEHAVIOUR, its rule in
 * QUESTION_SCHEMAS, its options in QUESTION_OPTION_GROUP, and its wording in
 * both message catalogues. Forgetting one of them breaks nothing at build
 * time — the page simply shows a raw key, or accepts anything, the first time
 * somebody opens it. These tests turn each of those quiet mistakes into a
 * failure, worded for whoever is editing the questionnaire rather than for an
 * engineer.
 *
 * Scope is the three namespaces the questionnaire owns: `intake.question.*`,
 * `intake.option.*` and `documents.item.*`. A catalogue-wide orphan check is
 * not possible: keys elsewhere are built from template strings, and no static
 * reading can tell which of them are alive.
 *
 * Runs with `pnpm check:intake`, without Docker, in about a second.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { SCHENGEN_SPAIN_DOCUMENTS } from "../rules/schengen-spain";
import {
  FIELD_BEHAVIOUR,
  OPTION_GROUPS,
  QUESTION_OPTION_GROUP,
  QUESTION_OPTIONS,
  QUESTION_SCHEMAS,
  parseQuestion,
} from "./schengen-tourism-v1";
import { INTAKE_SECTIONS } from "./sections";

const LOCALES = ["zh-CN", "en"] as const;
type Catalogue = Record<string, unknown>;

const SECTIONS_FILE = "packages/core/src/intake/sections.ts";
const RULES_FILE = "packages/core/src/intake/schengen-tourism-v1.ts";
const DOCUMENTS_FILE = "packages/core/src/rules/schengen-spain.ts";
const catalogueFile = (locale: string) => `apps/web/messages/${locale}.json`;
const BOTH_FILES = "zh-CN.json 和 en.json 两个文件";
const WRITE_SEPARATELY =
  "两种语言分别撰写，不要互译（见 design/guidelines/internationalization-en.md §7）。";

const catalogues: Record<string, Catalogue> = Object.fromEntries(
  LOCALES.map((locale) => [
    locale,
    JSON.parse(
      readFileSync(
        fileURLToPath(new URL(`../../../../apps/web/messages/${locale}.json`, import.meta.url)),
        "utf8",
      ),
    ) as Catalogue,
  ]),
);

/** The value at a dotted key, or undefined. */
function lookup(catalogue: Catalogue, key: string): unknown {
  return key.split(".").reduce<unknown>((node, part) => {
    if (typeof node !== "object" || node === null) return undefined;
    return (node as Record<string, unknown>)[part];
  }, catalogue);
}

function hasText(catalogue: Catalogue, key: string): boolean {
  const value = lookup(catalogue, key);
  return typeof value === "string" && value.trim() !== "";
}

/** The child names under a dotted key, or none if it is not an object. */
function childrenOf(catalogue: Catalogue, key: string): string[] {
  const node = lookup(catalogue, key);
  return typeof node === "object" && node !== null ? Object.keys(node) : [];
}

/**
 * Fail with every problem at once, one paragraph each.
 *
 * Listing them all matters: someone who adds three questions should see three
 * things to fix, not fix one and rerun twice to discover the others.
 */
function expectNoProblems(problems: string[]): void {
  if (problems.length === 0) return;
  const count = problems.length === 1 ? "发现 1 处问题" : `发现 ${problems.length} 处问题`;
  throw new Error(`问卷检查未通过，${count}：\n\n${problems.join("\n\n")}\n`);
}

const questions = INTAKE_SECTIONS.flatMap((section) =>
  section.questions.map((question) => ({ section: section.id, ...question })),
);
const questionName = (q: { section: string; id: string }) => `${q.section}/${q.id}`;

describe("questionnaire gate", () => {
  // 1 — the most common mistake: a question added, its wording not.
  it("每道题在两种语言里都有题面文案", () => {
    const problems: string[] = [];
    for (const question of questions) {
      for (const locale of LOCALES) {
        if (hasText(catalogues[locale]!, `intake.question.${question.section}.${question.id}`)) {
          continue;
        }
        problems.push(
          `${catalogueFile(locale)} 里没有 \`${questionName(question)}\` 这道题的文案（或文案是空的）。\n` +
            `请在 ${BOTH_FILES}的 intake.question.${question.section} 下各加一条 "${question.id}"。\n` +
            WRITE_SEPARATELY,
        );
      }
    }
    expectNoProblems(problems);
  });

  // 2 — a question removed from the form, its wording left behind.
  it("intake.question 下没有已删除题目留下的文案", () => {
    const problems: string[] = [];
    for (const locale of LOCALES) {
      const catalogue = catalogues[locale]!;
      for (const sectionId of childrenOf(catalogue, "intake.question")) {
        const section = INTAKE_SECTIONS.find((s) => s.id === sectionId);
        if (!section) {
          problems.push(
            `${catalogueFile(locale)} 的 intake.question 下有一组 "${sectionId}"，` +
              `但 ${SECTIONS_FILE} 里没有这一节。\n` +
              `如果这一节已经删掉，请把这一组文案从 ${BOTH_FILES}里一起删除；` +
              `如果是改了节的名字，请让两边一致。`,
          );
          continue;
        }
        // A question owns its wording and, optionally, a hint under `<id>Hint`.
        const owned = new Set(section.questions.flatMap((q) => [q.id, `${q.id}Hint`]));
        for (const key of childrenOf(catalogue, `intake.question.${sectionId}`)) {
          if (owned.has(key)) continue;
          problems.push(
            `${catalogueFile(locale)} 里有 intake.question.${sectionId}.${key}，` +
              `但 ${SECTIONS_FILE} 的 "${sectionId}" 节里没有对应的题。\n` +
              `如果这道题已经删掉，请把这条文案从 ${BOTH_FILES}里一起删除；` +
              `如果是改了题的 id，请让两边一致。提示语的键名必须是「题 id + Hint」。`,
          );
        }
      }
    }
    expectNoProblems(problems);
  });

  // 3 — options: every choice question names a set, every option in a set has
  //     a label in both languages, and no set holds labels nothing offers.
  it("每个选项在两种语言里都有文案，选项组里没有多余文案", () => {
    const problems: string[] = [];

    for (const question of questions) {
      const isChoice = FIELD_BEHAVIOUR[question.path]?.kind === "choice";
      const group = QUESTION_OPTION_GROUP[question.path];
      if (isChoice && !group) {
        problems.push(
          `\`${questionName(question)}\` 是选择题，但 ${RULES_FILE} 的 QUESTION_OPTION_GROUP ` +
            `里没有写它用哪一组选项。\n` +
            `请在 QUESTION_OPTION_GROUP 里加一行 "${question.path}": "<选项组名>"。`,
        );
      }
      if (group && !isChoice) {
        problems.push(
          `\`${questionName(question)}\` 在 QUESTION_OPTION_GROUP 里有选项组，` +
            `但 FIELD_BEHAVIOUR 里没有标成选择题，页面会显示成输入框。\n` +
            `请在 ${RULES_FILE} 的 FIELD_BEHAVIOUR 里给它写 { kind: "choice" }。`,
        );
      }
    }

    for (const [group, options] of Object.entries(OPTION_GROUPS)) {
      for (const locale of LOCALES) {
        for (const option of options) {
          if (hasText(catalogues[locale]!, `intake.option.${group}.${option}`)) continue;
          problems.push(
            `${catalogueFile(locale)} 里没有选项 \`${group}.${option}\` 的文案（或文案是空的）。\n` +
              `请在 ${BOTH_FILES}的 intake.option.${group} 下各加一条 "${option}"。\n` +
              WRITE_SEPARATELY,
          );
        }
      }
    }

    const groups = OPTION_GROUPS as Record<string, readonly string[]>;
    for (const locale of LOCALES) {
      const catalogue = catalogues[locale]!;
      for (const group of childrenOf(catalogue, "intake.option")) {
        const options = groups[group];
        if (!options) {
          problems.push(
            `${catalogueFile(locale)} 的 intake.option 下有一组 "${group}"，` +
              `但 ${RULES_FILE} 的 OPTION_GROUPS 里没有这一组。\n` +
              `如果这组选项已经不用了，请把它从 ${BOTH_FILES}里一起删除。`,
          );
          continue;
        }
        for (const key of childrenOf(catalogue, `intake.option.${group}`)) {
          if (options.includes(key)) continue;
          problems.push(
            `${catalogueFile(locale)} 里有选项文案 intake.option.${group}.${key}，` +
              `但 ${RULES_FILE} 里这一组没有 "${key}" 这个选项。\n` +
              `如果这个选项已经删掉，请把这条文案从 ${BOTH_FILES}里一起删除；` +
              `如果是改了选项的 id，请让两边一致。`,
          );
        }
      }
    }

    expectNoProblems(problems);
  });

  // 4 — every section has a title, the review section included.
  it("每一节在两种语言里都有标题", () => {
    const problems: string[] = [];
    for (const section of INTAKE_SECTIONS) {
      for (const locale of LOCALES) {
        if (hasText(catalogues[locale]!, `intake.section.${section.id}`)) continue;
        problems.push(
          `${catalogueFile(locale)} 里没有「${section.id}」这一节的标题。\n` +
            `请在 ${BOTH_FILES}的 intake.section 下各加一条 "${section.id}"。\n` +
            WRITE_SEPARATELY,
        );
      }
    }
    expectNoProblems(problems);
  });

  // 5 — every document has a name and a reason, and nothing else is filed
  //     under documents.item.
  it("每份材料在两种语言里都有名称和说明，没有多余文案", () => {
    const problems: string[] = [];
    for (const document of SCHENGEN_SPAIN_DOCUMENTS) {
      for (const locale of LOCALES) {
        for (const [key, what] of [
          [document.id, "名称"],
          [`${document.id}Why`, "「为什么要这份材料」的说明"],
        ] as const) {
          if (hasText(catalogues[locale]!, `documents.item.${key}`)) continue;
          problems.push(
            `${catalogueFile(locale)} 里没有材料「${document.id}」的${what}。\n` +
              `请在 ${BOTH_FILES}的 documents.item 下各加一条 "${key}"。\n` +
              WRITE_SEPARATELY,
          );
        }
      }
    }

    const owned = new Set(SCHENGEN_SPAIN_DOCUMENTS.flatMap((d) => [d.id, `${d.id}Why`]));
    for (const locale of LOCALES) {
      for (const key of childrenOf(catalogues[locale]!, "documents.item")) {
        if (owned.has(key)) continue;
        problems.push(
          `${catalogueFile(locale)} 里有材料文案 documents.item.${key}，` +
            `但 ${DOCUMENTS_FILE} 的材料清单里没有对应的材料。\n` +
            `如果这份材料已经从清单里删掉，请把这条文案从 ${BOTH_FILES}里一起删除；` +
            `如果是改了材料的 id，请让两边一致。说明的键名必须是「材料 id + Why」。`,
        );
      }
    }
    expectNoProblems(problems);
  });

  // 6 — a question without a rule accepts anything, unchanged.
  it("每道题都有校验规则", () => {
    // No rule in the intake accepts a symbol, so a question that does is one
    // falling through to parseQuestion's accept-anything branch.
    const notAnAnswer = Symbol("not an answer");
    const problems: string[] = [];
    for (const question of questions) {
      if (question.path in QUESTION_SCHEMAS && !parseQuestion(question.path, notAnAnswer).ok) {
        continue;
      }
      problems.push(
        `\`${questionName(question)}\` 这道题没有校验规则，现在填什么都会被接受。\n` +
          `请在 ${RULES_FILE} 的 QUESTION_SCHEMAS 里加一行 "${question.path}"，` +
          `并在对应的整表 schema 里加上这个字段。`,
      );
    }
    expectNoProblems(problems);
  });

  // 7 — a question without a behaviour gets a default text box and keyboard.
  it("每道题都有输入方式", () => {
    const problems = questions
      .filter((question) => !FIELD_BEHAVIOUR[question.path])
      .map(
        (question) =>
          `\`${questionName(question)}\` 这道题没有写输入方式（键盘类型、日期、选择题等）。\n` +
          `请在 ${RULES_FILE} 的 FIELD_BEHAVIOUR 里加一行 "${question.path}"。` +
          `普通文字题写 { inputMode: "text" } 即可。`,
      );
    expectNoProblems(problems);
  });

  // 8 — ids are what the URL and the resume point are made of.
  it("节 id 不重复，题 id 在节内不重复，答案路径全局不重复", () => {
    const problems: string[] = [];
    const repeated = (values: string[]) => [
      ...new Set(values.filter((value, index) => values.indexOf(value) !== index)),
    ];

    for (const id of repeated(INTAKE_SECTIONS.map((s) => s.id))) {
      problems.push(`${SECTIONS_FILE} 里有两节都叫 "${id}"。请给其中一节换一个 id。`);
    }
    for (const section of INTAKE_SECTIONS) {
      for (const id of repeated(section.questions.map((q) => q.id))) {
        problems.push(
          `${SECTIONS_FILE} 的 "${section.id}" 节里有两道题都叫 "${id}"。` +
            `题 id 会出现在网址里，同一节里必须唯一。请给其中一道换一个 id。`,
        );
      }
    }
    for (const path of repeated(questions.map((q) => q.path))) {
      const owners = questions.filter((q) => q.path === path).map(questionName);
      problems.push(
        `${SECTIONS_FILE} 里 ${owners.map((o) => `\`${o}\``).join("、")} 都把答案存在 "${path}"，` +
          `后填的会覆盖先填的。请给每道题一个自己的 path。`,
      );
    }
    expectNoProblems(problems);
  });

  // 9 — an empty section is read as a second review section by sectionState.
  it("除了 review，每一节至少有一道题", () => {
    const problems = INTAKE_SECTIONS.filter(
      (section) => section.id !== "review" && section.questions.length === 0,
    ).map(
      (section) =>
        `${SECTIONS_FILE} 里「${section.id}」这一节没有题。\n` +
        `没有题的节会被当成「检查并提交」，首页会多出一张点进去打不开的卡片。\n` +
        `请给这一节至少留一道题，或者把整节删掉（连同 intake.section.${section.id} 的文案）。`,
    );
    expectNoProblems(problems);
  });

  // Not one of the nine, but what stops 3 drifting: QUESTION_OPTIONS is what
  // the form renders, so it has to be exactly the declared groups.
  it("QUESTION_OPTIONS 与 QUESTION_OPTION_GROUP 一致", () => {
    for (const [path, group] of Object.entries(QUESTION_OPTION_GROUP)) {
      expect(QUESTION_OPTIONS[path]).toBe(OPTION_GROUPS[group]);
    }
    expect(Object.keys(QUESTION_OPTIONS).sort()).toEqual(Object.keys(QUESTION_OPTION_GROUP).sort());
  });
});
