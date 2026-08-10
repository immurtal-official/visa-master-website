import React from "react";
import { ChoiceRow } from "./ChoiceRow.jsx";

/** Full-width tappable rows, GOV.UK style. Each option may carry its own inline explanation. */
export function RadioGroup({ name, options = [], value, onChange, columns = 1 }) {
  return (
    <div role="radiogroup" style={{ display: "grid", gridTemplateColumns: `repeat(${columns},minmax(0,1fr))`, gap: "var(--space-3)" }}>
      {options.map((o) => (
        <ChoiceRow key={o.value} type="radio" name={name} value={o.value} title={o.title} hint={o.hint}
          checked={value === o.value} onChange={() => onChange && onChange(o.value)} />
      ))}
    </div>
  );
}
