export interface IconButtonProps {
  icon: string;
  /** Required — becomes aria-label and title. */
  label: string;
  /** Never below 44. */
  size?: number;
  variant?: "ghost" | "solid";
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
