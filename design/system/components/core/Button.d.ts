export interface ButtonProps {
  children?: React.ReactNode;
  /** primary is used once per view. */
  variant?: "primary" | "secondary" | "ghost" | "quiet";
  size?: "sm" | "md" | "lg";
  /** Lucide name rendered before the label. */
  icon?: string;
  iconAfter?: string;
  /** Full width — the default inside the sticky bottom bar. */
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
  as?: "button" | "a";
  href?: string;
  type?: "button" | "submit";
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
