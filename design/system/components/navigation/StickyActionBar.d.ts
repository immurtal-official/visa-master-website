export interface StickyActionBarProps {
  /** The primary action. Use block on mobile. */
  children?: React.ReactNode;
  secondary?: React.ReactNode;
  /** Reassurance line, e.g. auto-save state. */
  note?: React.ReactNode;
  sticky?: boolean;
  style?: React.CSSProperties;
}
export declare function StickyActionBar(props: StickyActionBarProps): JSX.Element;
