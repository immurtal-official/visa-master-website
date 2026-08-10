export interface CalloutProps {
  children?: React.ReactNode;
  tone?: "info" | "success" | "warning" | "error" | "quiet";
  title?: React.ReactNode;
  /** Lucide name, or null to drop the glyph. */
  icon?: string | null;
  style?: React.CSSProperties;
}
export declare function Callout(props: CalloutProps): JSX.Element;
