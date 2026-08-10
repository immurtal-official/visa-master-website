export interface ChoiceOption {
  value: string;
  title: React.ReactNode;
  /** Per-option explanation, shown inline under the title. */
  hint?: React.ReactNode;
}
export interface RadioGroupProps {
  name: string;
  options: ChoiceOption[];
  value?: string;
  onChange?: (value: string) => void;
  /** 1 on mobile; 2 only on desktop with short labels. */
  columns?: number;
}
export declare function RadioGroup(props: RadioGroupProps): JSX.Element;
