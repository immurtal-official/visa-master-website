"use client";

import { useId, useState } from "react";

export interface DateInputProps {
  name: string;
  /** ISO yyyy-mm-dd, or empty. */
  defaultValue?: string;
  labels: { year: string; month: string; day: string };
  invalid?: boolean;
  /** Id of the hint explaining the question this group answers. */
  describedBy?: string;
}

/** Field names and their widths. Not copy — the labels come from the catalogue. */
const PARTS = [
  { part: "year", width: 6, max: 4 },
  { part: "month", width: 4, max: 2 },
  { part: "day", width: 4, max: 2 },
] as const;

/**
 * A date as three numeric fields, in year / month / day order.
 *
 * Never a picker. A native date wheel is punishing for anything far from today
 * — a birth date is thirty years of scrolling — and its display order changes
 * with the device's locale, which is exactly the ambiguity a passport date
 * cannot afford. Three fields are unambiguous and fast on a phone keypad.
 */
export function DateInput({
  name,
  defaultValue = "",
  labels,
  invalid,
  describedBy,
}: DateInputProps) {
  const id = useId();
  const [year, month, day] = defaultValue.split("-");
  const [value, setValue] = useState({ year: year ?? "", month: month ?? "", day: day ?? "" });

  const iso =
    value.year && value.month && value.day
      ? `${value.year.padStart(4, "0")}-${value.month.padStart(2, "0")}-${value.day.padStart(2, "0")}`
      : "";

  const field = (part: "year" | "month" | "day", width: number, max: number) => (
    <span key={part} style={{ display: "grid", gap: "var(--space-1)" }}>
      <label
        htmlFor={`${id}-${part}`}
        style={{ fontSize: "var(--type-hint-size)", color: "var(--text-muted)" }}
      >
        {labels[part]}
      </label>
      <input
        id={`${id}-${part}`}
        inputMode="numeric"
        autoComplete="off"
        maxLength={max}
        value={value[part]}
        onChange={(event) =>
          setValue((current) => ({
            ...current,
            [part]: event.target.value.replace(/\D/g, "").slice(0, max),
          }))
        }
        style={{
          inlineSize: `${width}ch`,
          minBlockSize: "var(--control-h)",
          padding: "var(--space-3)",
          fontSize: "var(--type-input-size)",
          fontFamily: "var(--font-num)",
          textAlign: "center",
          color: "var(--text-body)",
          background: "var(--white)",
          border: `${invalid ? 2 : 1}px solid ${invalid ? "var(--red-500)" : "var(--border-input)"}`,
          borderRadius: "var(--radius-control)",
          boxShadow: "var(--shadow-inset-input)",
        }}
      />
    </span>
  );

  return (
    <div
      role="group"
      aria-describedby={describedBy}
      style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)", alignItems: "end" }}
    >
      {PARTS.map(({ part, width, max }) => field(part, width, max))}
      <input type="hidden" name={name} value={iso} />
    </div>
  );
}
