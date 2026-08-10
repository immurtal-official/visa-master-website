export {
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_SELF_NAMES,
  LOCALE_ROUTE_PREFIXES,
  isLocale,
  resolveLocale,
  localeSelfName,
  type Locale,
} from "./i18n/locales.js";

export {
  MESSAGE_KEYS,
  MESSAGE_KEY_LIST,
  isMessageKey,
  requiredParamsFor,
  type MessageKey,
} from "./i18n/message-keys.js";

export {
  i18nIssue,
  toIssues,
  toResult,
  type IssueParams,
  type ValidationIssue,
  type ValidationResult,
} from "./validation/issue.js";

export {
  emailSchema,
  otpCodeSchema,
  parseEmail,
  parseOtpCode,
  type EmailInput,
  type OtpCodeInput,
} from "./schemas/auth.js";
