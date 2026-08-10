import React from "react";
import { ChoiceRow } from "./ChoiceRow.jsx";

/** Same row shape as RadioGroup so a page never changes rhythm between question types. */
export function CheckboxGroup({ name, options = [], value = [], onChange, columns = 1 }) {
  const toggle = (v) => onChange && onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns},minmax(0,1fr))`, gap: "var(--space-3)" }}>
      {options.map((o) => (
        <ChoiceRow key={o.value} type="checkbox" name={name} value={o.value} title={o.title} hint={o.hint}
          checked={value.includes(o.value)} onChange={() => toggle(o.value)} />
      ))}
    </div>
  );
}
