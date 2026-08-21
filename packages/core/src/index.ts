export {
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_SELF_NAMES,
  LOCALE_ROUTE_PREFIXES,
  isLocale,
  resolveLocale,
  localeSelfName,
  type Locale,
} from "./i18n/locales";

export {
  MESSAGE_KEYS,
  MESSAGE_KEY_LIST,
  isMessageKey,
  requiredParamsFor,
  type MessageKey,
} from "./i18n/message-keys";

export {
  i18nIssue,
  toIssues,
  toResult,
  type IssueParams,
  type ValidationIssue,
  type ValidationResult,
} from "./validation/issue";

export {
  emailSchema,
  otpCodeSchema,
  parseEmail,
  parseOtpCode,
  type EmailInput,
  type OtpCodeInput,
} from "./schemas/auth";

export {
  CHENGDU_DISTRICT_AREAS,
  DESTINATIONS,
  EMPLOYMENT_STATUSES,
  PURPOSES,
  RESIDENCE_AREAS,
  SUPPORTED_ROUTE,
  UNSUPPORTED_REASONS,
  checkRoute,
  parseRouteCheck,
  routeCheckSchema,
  type Destination,
  type EmploymentStatus,
  type Purpose,
  type ResidenceArea,
  type RouteCheck,
  type RouteVerdict,
  type UnsupportedReason,
} from "./routes/route-gate";

export {
  INTAKE_SECTIONS,
  intakeProgress,
  nextQuestion,
  readAnswer,
  resumePoint,
  sectionState,
  type IntakeQuestion,
  type IntakeSection,
  type SectionState,
} from "./intake/sections";

export {
  FIELD_BEHAVIOUR,
  PASSPORT_VALIDITY_MONTHS,
  applicantSchema,
  intakeSchengenTourismV1,
  parseApplicant,
  parsePassport,
  parseQuestion,
  passportSchema,
  parseIntake,
  QUESTION_OPTIONS,
  residenceSchema,
  employmentSchema,
  travelSchema,
  companionsSchema,
  historySchema,
  TRAVELLING_WITH,
  WHO_PAYS,
  YES_NO_UNSURE,
  type FieldBehaviour,
  type IntakeSchengenTourismV1,
} from "./intake/schengen-tourism-v1";

export {
  SCHENGEN_SPAIN_DOCUMENTS,
  documentCompleteness,
  documentsFor,
  type DocumentCompleteness,
  type DocumentNecessity,
  type RequiredDocument,
  type UploadedDocument,
} from "./rules/schengen-spain";
