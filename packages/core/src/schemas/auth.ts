import { z } from "zod";
import { i18nIssue, toResult, type ValidationResult } from "../validation/issue";

/**
 * Sign-in identity. Trimmed before checking, because a pasted address routinely
 * carries a trailing space and rejecting that would be pedantry, not validation.
 */
export const emailSchema = z.object({
  email: z.string().trim().min(1).pipe(z.email()),
});

export type EmailInput = z.infer<typeof emailSchema>;

/**
 * The emailed sign-in code.
 *
 * Spaces are tolerated anywhere in the input: codes get pasted out of mail
 * clients that add them, and a code that is right in every way except its
 * whitespace is a right code.
 */
export const otpCodeSchema = z.object({
  code: z
    .string()
    .transform((value) => value.replace(/\s+/g, ""))
    .superRefine((value, ctx) => {
      if (value.length === 0) {
        ctx.addIssue(i18nIssue("validation.required"));
        return;
      }
      if (!/^\d{6}$/.test(value)) {
        ctx.addIssue(i18nIssue("validation.otp.invalidFormat"));
      }
    }),
});

export type OtpCodeInput = z.infer<typeof otpCodeSchema>;

export function parseEmail(input: unknown): ValidationResult<EmailInput> {
  return toResult(emailSchema.safeParse(input), input);
}

export function parseOtpCode(input: unknown): ValidationResult<OtpCodeInput> {
  return toResult(otpCodeSchema.safeParse(input), input);
}
