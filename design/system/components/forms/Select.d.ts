export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  options?: Array<string | { value: string; label: string }>;
  placeholder?: string;
  width?: "full" | "lg" | "md" | "sm" | string;
}
export declare function Select(props: SelectProps): JSX.Element;
