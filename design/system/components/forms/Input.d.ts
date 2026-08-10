export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  /** Width communicates expected answer length. */
  width?: "full" | "lg" | "md" | "sm" | "xs" | string;
}
export declare function Input(props: InputProps): JSX.Element;
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  rows?: number;
}
export declare function Textarea(props: TextareaProps): JSX.Element;
