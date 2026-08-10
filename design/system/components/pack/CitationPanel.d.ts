export interface CitationSource {
  title: string;
  publisher?: string;
  url?: string;
  /** Short verbatim line from the source. */
  quote?: string;
}
export interface CitationPanelProps {
  sources: CitationSource[];
  /** What we are NOT promising. Never hidden behind a link. */
  caveats?: string[];
  checkedAt?: string;
  style?: React.CSSProperties;
}
export declare function CitationPanel(props: CitationPanelProps): JSX.Element;
