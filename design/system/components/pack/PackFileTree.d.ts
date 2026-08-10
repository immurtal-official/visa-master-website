export type PackStatus = "ready" | "review" | "waiting" | "official";
export interface PackNode {
  id: string;
  name: string;
  kind?: "pdf" | "doc" | "img" | "link" | "folder";
  /** One of the four known states, or a pack-specific one as { label, tone }. */
  status?: PackStatus | { label: string; tone?: "success" | "info" | "warning" | "neutral" };
  /**
   * The language of THIS file, set by the destination country. A BCP-47 tag
   * ("de", "zh-CN") resolved to its self-name, or { code, name } to override.
   * Independent of the interface language, and always rendered on the row.
   */
  language?: string | { code?: string; name?: string };
  count?: number;
  children?: PackNode[];
}
export interface PackFileTreeProps {
  tree: PackNode[];
  selectedId?: string;
  onSelect?: (node: PackNode) => void;
  defaultOpen?: string[];
  /** The line explaining that file language is not interface language. On by default. */
  languageNote?: boolean;
  style?: React.CSSProperties;
}
export declare function PackFileTree(props: PackFileTreeProps): JSX.Element;
