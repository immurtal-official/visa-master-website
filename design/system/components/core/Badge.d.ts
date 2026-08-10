export interface BadgeProps {
  children?: React.ReactNode;
  tone?: "neutral" | "info" | "success" | "warning" | "error";
  icon?: string;
  size?: "sm" | "md";
  style?: React.CSSProperties;
}
export declare function Badge(props: BadgeProps): JSX.Element;
