"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";

const WIDTHS = {
  full: "100%",
  lg: "24em",
  md: "16em",
  sm: "10em",
  xs: "6em",
} as const;

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "style" | "width"
> {
  /** Already-resolved copy. Every caller reads it from the catalogue. */
  label?: ReactNode;
  hint?: ReactNode;
  /** Resolved from a message key by the caller — never a rule's own wording. */
  error?: ReactNode;
  /**
   * How much the field expects, in em — the width communicates the answer's
   * length. It is a max, so the control still shrinks on a narrow screen.
   */
  width?: keyof typeof WIDTHS;
  /**
   * Show the answer in capitals, for fields that are capitals on the document
   * they are copied from. The value is uppercased by the rule, not here.
   */
  uppercase?: boolean;
}

/**
 * A text field.
 *
 * Never below 16px: iOS Safari zooms the page when a smaller input takes focus,
 * and the resulting scroll jump loses people mid-form.
 */
export function Input({ label, hint, error, width = "full", uppercase, id, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const [focused, setFocused] = useState(false);

  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ");

  return (
    <div style={{ maxInlineSize: WIDTHS[width] }}>
      {label ? (
        <label
          htmlFor={inputId}
          style={{
            display: "block",
            marginBlockEnd: "var(--space-2)",
            fontSize: "var(--type-label-size)",
            lineHeight: "var(--type-label-lh)",
            fontWeight: "var(--fw-medium)",
            color: "var(--text-heading)",
          }}
        >
          {label}
        </label>
      ) : null}

      {hint ? (
        <p
          id={hintId}
          style={{
            marginBlockEnd: "var(--space-2)",
            fontSize: "var(--type-hint-size)",
            lineHeight: "var(--type-hint-lh)",
            color: "var(--text-muted)",
          }}
        >
          {hint}
        </p>
      ) : null}

      {/* The message sits above the field, where it is read before the input is
          re-entered rather than after. */}
      {error ? (
        <p
          id={errorId}
          style={{
            marginBlockEnd: "var(--space-2)",
            fontSize: "var(--fs-14)",
            lineHeight: "var(--type-hint-lh)",
            fontWeight: "var(--fw-medium)",
            color: "var(--status-error-fg)",
          }}
        >
          {error}
        </p>
      ) : null}

      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          inlineSize: "100%",
          minBlockSize: "var(--control-h)",
          padding: "var(--space-3) var(--space-4)",
          fontSize: "var(--type-input-size)",
          lineHeight: 1.5,
          fontFamily: "var(--font-sans)",
          color: "var(--text-body)",
          background: "var(--white)",
          border: `${error ? 2 : 1}px solid ${
            error ? "var(--red-500)" : focused ? "var(--blue-600)" : "var(--border-input)"
          }`,
          borderRadius: "var(--radius-control)",
          boxShadow: "var(--shadow-inset-input)",
          outline: focused ? "3px solid var(--focus-ring)" : "none",
          outlineOffset: 2,
          transition: "var(--transition-control)",
          textTransform: uppercase ? "uppercase" : undefined,
        }}
        {...rest}
      />
    </div>
  );
}
