"use client";

import { useEffect, useRef } from "react";
import { Icon } from "./icon";

export interface SummarisedError {
  /** The id of the field this message belongs to. */
  field: string;
  /** Already resolved against the active locale by the caller. */
  message: string;
}

export interface ErrorSummaryProps {
  /** Resolved copy, e.g. the catalogue's errorSummary.title. */
  title: string;
  errors: SummarisedError[];
}

/**
 * Sits at the very top of a page that failed validation, takes focus when it
 * appears, and links to each field.
 *
 * Every message says what to do next rather than what went wrong, and each one
 * is repeated inline on its own field: the summary is how someone finds the
 * problems, the inline message is how they fix one.
 */
export function ErrorSummary({ title, errors }: ErrorSummaryProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  if (errors.length === 0) return null;

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      style={{
        padding: "var(--space-4) var(--space-5)",
        marginBlockEnd: "var(--space-6)",
        background: "var(--status-error-bg)",
        border: "1px solid var(--status-error-border)",
        borderInlineStart: "4px solid var(--red-500)",
        borderStartEndRadius: "var(--radius-card)",
        borderEndEndRadius: "var(--radius-card)",
      }}
    >
      <h2
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          margin: 0,
          color: "var(--status-error-fg)",
          fontSize: "var(--fs-18)",
          lineHeight: "var(--type-h3-lh)",
          fontWeight: "var(--fw-semibold)",
        }}
      >
        <Icon name="circle-alert" size={20} />
        {title}
      </h2>

      <ul
        style={{
          margin: "var(--space-3) 0 0",
          padding: 0,
          listStyle: "none",
          display: "grid",
          gap: "var(--space-2)",
        }}
      >
        {errors.map((error) => (
          <li key={error.field}>
            <a
              href={`#${error.field}`}
              style={{
                color: "var(--status-error-fg)",
                fontSize: "var(--fs-16)",
                textDecorationThickness: 1,
              }}
            >
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
