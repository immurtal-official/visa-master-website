import { z } from "zod";
import type { Condition } from "./condition";
import {
  amountInYuan,
  dateString,
  mobilePhone,
  passportDatesCheck,
  passportExpiryAlone,
  passportNumber,
  passportOutlivesTripCheck,
  pastDate,
  pinyin,
  text,
  travelDatesCheck,
  type CrossCheck,
} from "./rules";

/**
 * The questionnaire: every question the intake asks, in the order it asks
 * them, and everything about each question in one place.
 *
 * This is the file to edit to change the form. Reordering is moving a line;
 * adding a question is adding an entry; removing one is deleting it. Each
 * question's wording lives in apps/web/messages/{zh-CN,en}.json under
 * `intake.question.<section>.<question>`, written separately in each language.
 * `pnpm check:intake` says, in plain words, anything that does not line up.
 * HOW-TO-EDIT.zh.md walks through it step by step.
 *
 * Two kinds of question live here, and the difference is who reads the answer:
 *
 *   Core questions (no `extra`) feed the job contract — the documents the
 *   pack produces, the checklist, the conductor's input. Their ids, kinds,
 *   rules and options are recorded in contract.lock.json, and changing one is
 *   an engineering change: the gate refuses it until the lock is updated
 *   with it. Their order and their wording are free.
 *
 *   Extra questions (`extra: true`) are answered and stored like any other,
 *   under `extra.<section>.<id>`, and travel to the job as supplementary
 *   material that nothing downstream depends on. They can be added, changed,
 *   reordered and removed freely, in any section, including a new one. An
 *   extra question must give an `example`: a valid answer, which the gate
 *   checks against its rule and the end-to-end tests type in.
 *
 * What a question can declare:
 *
 *   id        Stable. It is in the URL, it is the resume point, and the answer
 *             is stored under `<section>.<id>`. Renaming it orphans answers
 *             already given.
 *   kind      "text" (the default), "date", or "choice".
 *   rule      What counts as a valid answer — one of the rules in rules.ts.
 *             A choice question's rule is its options, so it has none.
 *   options   For a choice question: which option set it offers. The sets
 *             are below, and their labels are under `intake.option.<set>`.
 *   alone     Optional. A stricter rule to apply when the question is
 *             answered on its own page — for a check that does not need any
 *             other answer and is worth knowing about straight away.
 *   keyboard  Optional. How a phone keyboard should behave for the field.
 *   extra     true for a question nothing downstream depends on (see above).
 *   example   A valid answer. Required for an extra question.
 *   showIf    Optional. Ask the question only when an earlier choice question
 *             has a given answer — `{ answer: "companions.whoPays", is:
 *             "family" }`, the same conditions the document checklist uses
 *             (condition.ts). A question not asked does not count towards
 *             finishing, and any answer it had is left out of the submission.
 *
 * A section can also declare `check`, a rule relating two of its answers
 * which runs when the whole form is checked (and only when every core question
 * in the section is asked), and `showIf`, to ask the whole section only when a
 * condition holds.
 */

/** How keyboards should behave for a field, derived from what it holds. */
export interface Keyboard {
  inputMode?: "text" | "numeric" | "tel" | "email" | "decimal";
  autoComplete?: string;
  autoCapitalize?: "off" | "characters";
  autoCorrect?: "off";
  /** Uppercase as it is typed, for fields that are uppercase on the document. */
  uppercase?: boolean;
  maxLength?: number;
}

export const TRAVELLING_WITH = ["alone", "family", "friends", "colleagues"] as const;
export const WHO_PAYS = ["self", "family", "employer"] as const;
export const YES_NO_UNSURE = ["yes", "no", "unsure"] as const;

/**
 * The option sets, by the name their labels are filed under.
 *
 * A set's labels live at `intake.option.<set>.<option>`. Yes/no/not-sure is
 * one set shared by several questions, because the same three words should
 * read the same wherever they are offered.
 */
export const OPTION_GROUPS = {
  travellingWith: TRAVELLING_WITH,
  whoPays: WHO_PAYS,
  yesNoUnsure: YES_NO_UNSURE,
} as const satisfies Record<string, readonly string[]>;

export type OptionGroup = keyof typeof OPTION_GROUPS;

interface QuestionCommon {
  id: string;
  /** Answered and stored like any other, but outside the job contract. */
  extra?: true;
  /** A valid answer: checked against the rule, and typed in by the e2e tests. */
  example?: string;
  /** Ask only when this holds of the answers to earlier questions. */
  showIf?: Condition;
}

export type QuestionDefinition =
  | (QuestionCommon & {
      kind?: "text" | "date";
      rule: z.ZodType;
      alone?: z.ZodType;
      keyboard?: Keyboard;
    })
  | (QuestionCommon & {
      kind: "choice";
      options: OptionGroup;
    });

export type SectionDefinition =
  | {
      id: string;
      kind?: "questions";
      questions: QuestionDefinition[];
      check?: CrossCheck;
      /** False while the section has not been built. */
      available?: boolean;
      /** Ask the section at all only when this holds of earlier answers. */
      showIf?: Condition;
    }
  | {
      /** A reading of everything answered, and the one place the whole form is checked. */
      id: string;
      kind: "review";
    };

/**
 * Where a question's answer is stored in `applications.answers`, and what the
 * job receives it under: `<section>.<id>`, or `extra.<section>.<id>` for an
 * extra question.
 */
export function answerPath(sectionId: string, question: { id: string; extra?: true }): string {
  return question.extra ? `extra.${sectionId}.${question.id}` : `${sectionId}.${question.id}`;
}

export interface QuestionnaireDefinition {
  sections: SectionDefinition[];
  /** Rules relating answers in different sections. */
  check?: CrossCheck;
}

export const QUESTIONNAIRE = {
  sections: [
    {
      id: "applicant",
      questions: [
        { id: "name", rule: text(1, 60), keyboard: { inputMode: "text", autoComplete: "name" } },
        {
          id: "pinyin",
          rule: pinyin,
          keyboard: {
            inputMode: "text",
            autoComplete: "off",
            autoCapitalize: "characters",
            autoCorrect: "off",
            uppercase: true,
          },
        },
        { id: "birthDate", kind: "date", rule: pastDate, keyboard: { autoComplete: "bday" } },
        {
          id: "phone",
          rule: mobilePhone,
          keyboard: { inputMode: "tel", autoComplete: "tel", maxLength: 20 },
        },
      ],
    },
    {
      id: "passport",
      questions: [
        {
          id: "number",
          rule: passportNumber,
          keyboard: {
            inputMode: "text",
            autoComplete: "off",
            autoCapitalize: "characters",
            autoCorrect: "off",
            uppercase: true,
            maxLength: 9,
          },
        },
        { id: "issuedAt", kind: "date", rule: dateString },
        { id: "expiresAt", kind: "date", rule: dateString, alone: passportExpiryAlone },
      ],
      check: passportDatesCheck,
    },
    {
      id: "residence",
      questions: [
        {
          id: "city",
          rule: text(1, 40),
          keyboard: { inputMode: "text", autoComplete: "address-level2" },
        },
        {
          id: "address",
          rule: text(4, 200),
          keyboard: { inputMode: "text", autoComplete: "street-address" },
        },
      ],
    },
    {
      id: "employment",
      questions: [
        {
          id: "employer",
          rule: text(1, 120),
          keyboard: { inputMode: "text", autoComplete: "organization" },
        },
        {
          id: "position",
          rule: text(1, 80),
          keyboard: { inputMode: "text", autoComplete: "organization-title" },
        },
        { id: "startDate", kind: "date", rule: pastDate },
        {
          id: "monthlyIncome",
          rule: amountInYuan,
          // Money on a phone needs the decimal keypad, not the alphabetic one.
          keyboard: { inputMode: "decimal", autoComplete: "off", maxLength: 12 },
        },
      ],
    },
    {
      id: "travel",
      questions: [
        { id: "departureDate", kind: "date", rule: dateString },
        { id: "returnDate", kind: "date", rule: dateString },
        { id: "cities", rule: text(2, 200), keyboard: { inputMode: "text", autoComplete: "off" } },
      ],
      check: travelDatesCheck,
    },
    {
      id: "companions",
      questions: [
        { id: "travellingWith", kind: "choice", options: "travellingWith" },
        { id: "whoPays", kind: "choice", options: "whoPays" },
      ],
    },
    {
      id: "history",
      questions: [
        { id: "schengenBefore", kind: "choice", options: "yesNoUnsure" },
        { id: "refused", kind: "choice", options: "yesNoUnsure" },
      ],
    },
    // The last section is not questions but a reading of everything answered,
    // and the one place the whole form is checked at once.
    { id: "review", kind: "review" },
  ],
  check: passportOutlivesTripCheck,
} satisfies QuestionnaireDefinition;
