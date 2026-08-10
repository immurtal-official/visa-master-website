export interface DateParts { year?: string; month?: string; day?: string }
export interface DateInputProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  value?: DateParts;
  onChange?: (value: DateParts) => void;
}
export declare function DateInput(props: DateInputProps): JSX.Element;
