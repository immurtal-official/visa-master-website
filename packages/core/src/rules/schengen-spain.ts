/**
 * Which documents this route demands, and why each one is asked for.
 *
 * This is deterministic code, not a model's opinion. What a consulate requires
 * is a fact about a route on a date; a system that guessed it would be wrong
 * occasionally and confidently, and the cost of being wrong is a rejected
 * application. The same list is read by the screen that asks for the documents
 * and by the check that runs before anything is sent, so the two cannot
 * disagree about what complete means.
 *
 * Route: a resident of the Chengdu consular district, Spanish Schengen visa,
 * personal tourism, applicant in employment.
 *
 * Adding a document: an entry here, and its name and its reason in both
 * catalogues under `documents.item.<id>` and `documents.item.<id>Why`. A
 * document asked for only in some circumstances says so with `appliesWhen`, a
 * condition on core answers (see intake/condition.ts); `pnpm check:intake`
 * checks every condition against the questionnaire.
 */

import { conditionHolds, type Condition } from "../intake/condition";

export type DocumentNecessity = "required" | "recommended" | "conditional";

export interface RequiredDocument {
  id: string;
  necessity: DocumentNecessity;
  /** More than one page is normal for this document. */
  multiPage: boolean;
  /** Asked for only when this holds of the application's answers. */
  appliesWhen?: Condition;
}

export const SCHENGEN_SPAIN_DOCUMENTS: RequiredDocument[] = [
  // Identity, and the pages that carry it.
  { id: "passportBio", necessity: "required", multiPage: false },
  { id: "photo", necessity: "required", multiPage: false },
  { id: "hukou", necessity: "required", multiPage: true },

  // That the applicant has a life to come back to. Consulates read the
  // employment letter and the salary record against each other, which is why
  // both are asked for and why the intake asks for the figure as well.
  { id: "employmentLetter", necessity: "required", multiPage: false },
  { id: "bankStatement", necessity: "required", multiPage: true },
  { id: "socialInsurance", necessity: "recommended", multiPage: true },

  // The trip itself.
  { id: "insurance", necessity: "required", multiPage: false },
  { id: "flightBooking", necessity: "required", multiPage: false },
  { id: "hotelBooking", necessity: "required", multiPage: true },

  // Only when somebody else is paying: their money has to be evidenced too.
  {
    id: "sponsorProof",
    necessity: "conditional",
    multiPage: true,
    appliesWhen: { answer: "companions.whoPays", in: ["family", "employer"] },
  },
  // Earlier Schengen visas count as travel history and are worth showing.
  {
    id: "previousVisas",
    necessity: "conditional",
    multiPage: true,
    appliesWhen: { answer: "history.schengenBefore", is: "yes" },
  },
];

/** The documents this particular application has to provide. */
export function documentsFor(answers: unknown): RequiredDocument[] {
  return SCHENGEN_SPAIN_DOCUMENTS.filter(
    (document) => !document.appliesWhen || conditionHolds(document.appliesWhen, answers),
  );
}

export interface UploadedDocument {
  document: string;
  status: string;
}

export interface DocumentCompleteness {
  /** Documents that must be provided and have not been. */
  missing: string[];
  /** Provided but not yet confirmed by the server. */
  pending: string[];
  /** Everything mandatory is confirmed present. */
  complete: boolean;
}

/**
 * What is still outstanding.
 *
 * Only a confirmed upload counts. A row that says `pending` is one the browser
 * announced and the server has not seen the bytes for — treating that as done
 * is exactly how a missing passport scan reaches a reviewer.
 */
export function documentCompleteness(
  answers: unknown,
  uploads: UploadedDocument[],
): DocumentCompleteness {
  const stored = new Set(
    uploads.filter((upload) => upload.status === "stored").map((upload) => upload.document),
  );
  const announced = new Set(
    uploads.filter((upload) => upload.status === "pending").map((upload) => upload.document),
  );

  const needed = documentsFor(answers).filter((document) => document.necessity !== "recommended");

  const missing = needed
    .filter((document) => !stored.has(document.id))
    .map((document) => document.id);

  const pending = needed
    .filter((document) => !stored.has(document.id) && announced.has(document.id))
    .map((document) => document.id);

  return { missing, pending, complete: missing.length === 0 };
}

/** An upload row as the submission reads it. */
export interface StoredUpload {
  id: string;
  document: string;
  page: number;
  status: string;
  content_type: string;
}

/** One document page as the job receives it: a reference, never a location. */
export interface JobDocument {
  uploadId: string;
  document: string;
  page: number;
  contentType: string;
}

/**
 * The documents a job is given, as references.
 *
 * Only confirmed uploads, and only for documents this application actually
 * needs — a sponsor's bank statement uploaded before the applicant changed
 * who is paying is not part of this pack. Ordered by checklist position and
 * then page, because the page order of a bank statement is part of what the
 * consulate reads.
 *
 * Each carries the upload's id and nothing that locates it. A storage path
 * begins with the owner's user id, and the job's input never carries the
 * account; the conductor, which holds the credential, resolves an id to its
 * object. The container sees neither.
 */
export function documentsForJob(answers: unknown, uploads: StoredUpload[]): JobDocument[] {
  const needed = documentsFor(answers).map((document) => document.id);
  return uploads
    .filter((upload) => upload.status === "stored" && needed.includes(upload.document))
    .sort((a, b) => needed.indexOf(a.document) - needed.indexOf(b.document) || a.page - b.page)
    .map((upload) => ({
      uploadId: upload.id,
      document: upload.document,
      page: upload.page,
      contentType: upload.content_type,
    }));
}
