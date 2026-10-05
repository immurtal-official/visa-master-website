import { z } from "zod";
import { hasAnswer } from "./answers";
import type { AnswerSource } from "./provenance";
import { parseQuestion } from "./schengen-tourism-v1";
import { askedPath } from "./sections";

/**
 * Turning what was read off a document into proposed answers.
 *
 * Whatever reads the document — a fixture today, a model behind the gateway
 * later — only reports what it saw: a field, a value, how sure it is, which
 * page. Everything after that is decided here, deterministically, and not by
 * the reader: which of those values may become an answer, and how. A model
 * does not get to decide that a passport number goes into the form.
 *
 * A value is proposed only:
 *   - for a field this document was asked to supply;
 *   - for a question the form currently asks;
 *   - where the applicant has not answered it themselves — a typed answer is
 *     never overwritten by something read off a scan, however confident;
 *   - and when it passes the question's own rule, normalised the same way a
 *     typed answer is.
 * A proposal is stored like any answer and recorded as a document-sourced
 * placeholder, which the submission refuses until the applicant confirms it.
 */

/** One field, as an extractor reports it. */
export const extractedFieldSchema = z.object({
  field: z.string().min(1),
  value: z.string().trim().min(1).max(1000),
  confidence: z.number().min(0).max(1).optional(),
  sourcePage: z.number().int().min(1).optional(),
});

/** What an extractor hands back: `extraction.json` in the job's scratch. */
export const extractionResultSchema = z.object({
  fields: z.array(extractedFieldSchema).max(200),
});

export type ExtractedField = z.infer<typeof extractedFieldSchema>;

/** What the conductor writes back for one field that becomes a proposal. */
export interface Proposal {
  path: string;
  /** The value as the question's rule normalises it. */
  value: unknown;
}

export interface ProposalDecision {
  /** Fields this document was asked for — all are recorded as document fields. */
  recorded: ExtractedField[];
  /** The subset that becomes proposed answers. */
  proposals: Proposal[];
}

/**
 * Decide, for one document's extraction, what is recorded and what is
 * proposed. Pure: the conductor does the writing.
 */
export function decideProposals(input: {
  fields: ExtractedField[];
  /** The fields the document was asked to supply (the job's input). */
  requested: readonly string[];
  answers: unknown;
  sources: AnswerSource[];
}): ProposalDecision {
  const requested = new Set(input.requested);
  const asked = new Set(askedPath(input.answers).map((question) => question.path));
  const sourceByPath = new Map(input.sources.map((source) => [source.path, source]));

  // One value per field: a reader that reports a field twice gets its first.
  const seen = new Set<string>();
  const recorded = input.fields.filter((field) => {
    if (!requested.has(field.field) || seen.has(field.field)) return false;
    seen.add(field.field);
    return true;
  });

  const proposals: Proposal[] = [];
  for (const field of recorded) {
    if (!asked.has(field.field)) continue;

    const source = sourceByPath.get(field.field);
    if (source?.source === "applicant") continue;
    // Answered with no record of where from: typed before sources existed.
    if (!source && hasAnswer(input.answers, field.field)) continue;

    const parsed = parseQuestion(field.field, field.value);
    if (!parsed.ok) continue;
    proposals.push({ path: field.field, value: parsed.data });
  }

  return { recorded, proposals };
}
