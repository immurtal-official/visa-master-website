import { MESSAGE_KEYS } from "../i18n/message-keys";
import {
  OPTION_GROUPS,
  QUESTIONNAIRE,
  answerPath,
  type SectionDefinition,
} from "../intake/questionnaire";
import { ruleName } from "../intake/rules";
import { INTAKE_CHECKSUM, INTAKE_VERSION } from "../intake/version";
import {
  CHENGDU_DISTRICT_AREAS,
  DESTINATIONS,
  EMPLOYMENT_STATUSES,
  PURPOSES,
  RESIDENCE_AREAS,
  SUPPORTED_ROUTE,
} from "../routes/route-gate";
import { SCHENGEN_SPAIN_DOCUMENTS } from "../rules/schengen-spain";

/**
 * The rules' data, as a language-neutral document (ADR-005).
 *
 * packages/core is the only place a rule is written. A backend in another
 * language reads this instead of the TypeScript: which sections and questions
 * exist and in what order, how each is answered, which named rule each must
 * meet, when each is asked, the checklist and its conditions, the route gate's
 * tables, the message keys a rule may emit, and the contract's identity. Only
 * the named rules themselves are implemented a second time, and the
 * conformance vectors hold that implementation to this one.
 *
 * Written by `pnpm intake:export`; never edited by hand.
 */
export function intakeData() {
  const sections = (QUESTIONNAIRE.sections as SectionDefinition[]).map((section) => {
    if (section.kind === "review") return { id: section.id, kind: "review" as const };
    return {
      id: section.id,
      kind: "questions" as const,
      available: section.available ?? true,
      ...(section.showIf ? { showIf: section.showIf } : {}),
      ...(section.check ? { check: ruleName(section.check) ?? null } : {}),
      questions: section.questions.map((question) => {
        const common = {
          id: question.id,
          path: answerPath(section.id, question),
          extra: Boolean(question.extra),
          ...(question.showIf ? { showIf: question.showIf } : {}),
          ...(question.example !== undefined ? { example: question.example } : {}),
        };
        if (question.kind === "choice") {
          return { ...common, kind: "choice" as const, options: question.options };
        }
        return {
          ...common,
          kind: question.kind ?? "text",
          rule: ruleName(question.rule) ?? null,
          ...(question.alone !== undefined ? { alone: ruleName(question.alone) ?? null } : {}),
        };
      }),
    };
  });

  return {
    contract: { version: INTAKE_VERSION, checksum: INTAKE_CHECKSUM },
    optionGroups: OPTION_GROUPS,
    sections,
    formCheck: QUESTIONNAIRE.check ? (ruleName(QUESTIONNAIRE.check) ?? null) : null,
    documents: SCHENGEN_SPAIN_DOCUMENTS.map((document) => ({
      id: document.id,
      necessity: document.necessity,
      multiPage: document.multiPage,
      ...(document.appliesWhen ? { appliesWhen: document.appliesWhen } : {}),
      ...(document.extracts ? { extracts: document.extracts } : {}),
    })),
    route: {
      residenceAreas: RESIDENCE_AREAS,
      chengduDistrictAreas: CHENGDU_DISTRICT_AREAS,
      destinations: DESTINATIONS,
      purposes: PURPOSES,
      employmentStatuses: EMPLOYMENT_STATUSES,
      supported: SUPPORTED_ROUTE,
    },
    messageKeys: MESSAGE_KEYS,
  };
}
