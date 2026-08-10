export interface ChoiceOption {
  value: string;
  title: React.ReactNode;
  /** Per-option explanation, shown inline under the title. */
  hint?: React.ReactNode;
}
export interface CheckboxGroupProps {
  name: string;
  options: ChoiceOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  columns?: number;
}
export declare function CheckboxGroup(props: CheckboxGroupProps): JSX.Element;
