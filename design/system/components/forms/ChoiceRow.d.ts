export interface ChoiceOption {
  value: string;
  title: React.ReactNode;
  /** Per-option explanation, shown inline under the title. */
  hint?: React.ReactNode;
}
export interface ChoiceRowProps {
  type: "radio" | "checkbox";
  name: string;
  value: string;
  title: React.ReactNode;
  hint?: React.ReactNode;
  checked?: boolean;
  onChange?: () => void;
}
export declare function ChoiceRow(props: ChoiceRowProps): JSX.Element;
