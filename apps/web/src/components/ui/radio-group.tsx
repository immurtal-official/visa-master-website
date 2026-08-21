"use client";

import { useId, type ReactNode } from "react";

export interface ChoiceOption {
  value: string;
  /** Already-resolved copy. Every caller reads it from the catalogue. */
  title: string;
  hint?: string;
}

export interface RadioGroupProps {
  name: string;
  legend: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  options: ChoiceOption[];
  defaultValue?: string;
}

/**
 * A single choice, as full-width tappable rows.
 *
 * Rows rather than a dropdown, because the options are the question: someone
 * deciding between "personal tourism" and "visiting family" should see both
 * without opening anything. Each row carries its own explanation inline —
 * there is no hover on a phone, and half of this product's traffic is inside
 * an in-app browser.
 */
export function RadioGroup({ name, legend, hint, error, options, defaultValue }: RadioGroupProps) {
  const groupId = useId();
  const errorId = `${groupId}-error`;

  return (
    <fieldset
      style={{ border: 0, padding: 0, margin: 0, minInlineSize: 0 }}
      aria-describedby={error ? errorId : undefined}
    >
      <legend
        style={{
          padding: 0,
          fontSize: "var(--type-label-size)",
          lineHeight: "var(--type-label-lh)",
          fontWeight: "var(--fw-medium)",
          color: "var(--text-heading)",
        }}
      >
        {legend}
      </legend>

      {hint ? (
        <p
          style={{
            marginBlock: "var(--space-2) 0",
            fontSize: "var(--type-hint-size)",
            lineHeight: "var(--type-hint-lh)",
            color: "var(--text-muted)",
            maxInlineSize: "var(--measure-question)",
          }}
        >
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={errorId}
          style={{
            marginBlock: "var(--space-2) 0",
            fontSize: "var(--fs-14)",
            fontWeight: "var(--fw-medium)",
            color: "var(--status-error-fg)",
          }}
        >
          {error}
        </p>
      ) : null}

      <div
        style={{
          display: "grid",
          gap: "var(--space-2)",
          marginBlockStart: "var(--space-3)",
        }}
      >
        {options.map((option) => {
          const id = `${groupId}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "var(--space-3)",
                minBlockSize: "var(--touch-min)",
                padding: "var(--space-3) var(--space-4)",
                background: "var(--surface-card)",
                border: `1px solid ${error ? "var(--red-500)" : "var(--border-default)"}`,
                borderRadius: "var(--radius-control)",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                id={id}
                name={name}
                value={option.value}
                defaultChecked={defaultValue === option.value}
                style={{ inlineSize: 20, blockSize: 20, marginBlockStart: 2, flex: "none" }}
              />
              <span style={{ minInlineSize: 0 }}>
                <span style={{ display: "block", color: "var(--text-body)" }}>{option.title}</span>
                {option.hint ? (
                  <span
                    style={{
                      display: "block",
                      marginBlockStart: "var(--space-1)",
                      fontSize: "var(--type-hint-size)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {option.hint}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
