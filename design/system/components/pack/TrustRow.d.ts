export interface TrustRowProps {
  items: Array<string | { label: string; icon?: string }>;
  tone?: "default" | "inverse";
  style?: React.CSSProperties;
}
export declare function TrustRow(props: TrustRowProps): JSX.Element;
