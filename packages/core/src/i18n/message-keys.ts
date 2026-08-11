/**
 * Every message key a validation rule may emit, with the ICU parameters that
 * key requires.
 *
 * Validation never produces a sentence. A rule that fails emits a key plus its
 * parameters (`passport.expiry.tooSoon` with `{monthsRequired: 3}`) and the
 * front end resolves that against the active locale. This registry is what
 * makes the arrangement checkable: the build fails when a key here is missing
 * from either catalogue, or when a catalogue message does not carry the
 * parameters the key declares (internationalization guideline §3).
 */
export const MESSAGE_KEYS = {
  "validation.required": [],
  "validation.invalid": [],
  "validation.email.invalid": [],
  "validation.otp.invalidFormat": [],
  "validation.tooShort": ["min"],
  "validation.tooLong": ["max"],
  "validation.date.invalid": [],
  "validation.date.future": [],
  "validation.phone.invalid": [],
  "validation.pinyin.invalid": [],
  "validation.passport.number.invalid": ["length"],
  "validation.passport.expiry.beforeIssue": [],
  "validation.passport.expiry.tooSoon": ["monthsRequired"],
} as const satisfies Record<string, readonly string[]>;

export type MessageKey = keyof typeof MESSAGE_KEYS;

export const MESSAGE_KEY_LIST = Object.keys(MESSAGE_KEYS) as MessageKey[];

export function isMessageKey(value: unknown): value is MessageKey {
  return typeof value === "string" && value in MESSAGE_KEYS;
}

export function requiredParamsFor(key: MessageKey): readonly string[] {
  return MESSAGE_KEYS[key];
}
